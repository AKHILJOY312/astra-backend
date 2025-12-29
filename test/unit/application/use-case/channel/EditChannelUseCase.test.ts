import { EditChannelUseCase } from "@/application/use-cases/channel/EditChannelUseCase";
import {
  BadRequestError,
  UnauthorizedError,
} from "@/application/error/AppError";
import type { IChannelRepository } from "@/application/ports/repositories/IChannelRepository";
import type { IProjectMembershipRepository } from "@/application/ports/repositories/IProjectMembershipRepository";
import type { EditChannelDTO } from "@/application/dto/channel/channelDtos";
import { Channel } from "@/domain/entities/channel/Channel";

describe("EditChannelUseCase (Unit)", () => {
  let channelRepo: Partial<IChannelRepository>;
  let membershipRepo: Partial<IProjectMembershipRepository>;
  let useCase: EditChannelUseCase;

  const channel = new Channel({
    id: "channel-1",
    projectId: "project-1",
    channelName: "general",
    description: "old description",
    createdBy: "user-1",
    visibleToRoles: ["manager", "member"],
    permissionsByRole: {
      manager: "manager",
      member: "view",
    },
  });

  const baseInput: EditChannelDTO = {
    channelId: "channel-1",
    userId: "user-1",
  };

  beforeEach(() => {
    channelRepo = {
      findById: jest.fn(),
      findByProjectAndName: jest.fn(),
      update: jest.fn(),
    };

    membershipRepo = {
      findByProjectAndUser: jest.fn(),
    };

    useCase = new EditChannelUseCase(
      channelRepo as IChannelRepository,
      membershipRepo as IProjectMembershipRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --------------------------------------------------
  //  Channel existence
  // --------------------------------------------------

  it("should throw BadRequestError if channel not found", async () => {
    (channelRepo.findById as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute(baseInput)).rejects.toBeInstanceOf(
      BadRequestError
    );
  });

  // --------------------------------------------------
  //  Authorization
  // --------------------------------------------------

  it("should throw UnauthorizedError if membership not found", async () => {
    (channelRepo.findById as jest.Mock).mockResolvedValue(channel);
    (membershipRepo.findByProjectAndUser as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute(baseInput)).rejects.toBeInstanceOf(
      UnauthorizedError
    );
  });

  it("should throw UnauthorizedError if user is not manager", async () => {
    (channelRepo.findById as jest.Mock).mockResolvedValue(channel);
    (membershipRepo.findByProjectAndUser as jest.Mock).mockResolvedValue({
      role: "member",
    });

    await expect(useCase.execute(baseInput)).rejects.toBeInstanceOf(
      UnauthorizedError
    );
  });

  // --------------------------------------------------
  //  Duplicate channel name
  // --------------------------------------------------

  it("should throw BadRequestError if new channel name already exists", async () => {
    (channelRepo.findById as jest.Mock).mockResolvedValue(channel);
    (membershipRepo.findByProjectAndUser as jest.Mock).mockResolvedValue({
      role: "manager",
    });

    (channelRepo.findByProjectAndName as jest.Mock).mockResolvedValue(
      {} as Channel
    );

    await expect(
      useCase.execute({
        ...baseInput,
        channelName: "random",
      })
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  // --------------------------------------------------
  // ✅ Successful update
  // --------------------------------------------------

  it("should update channel fields successfully", async () => {
    (channelRepo.findById as jest.Mock).mockResolvedValue(channel);
    (membershipRepo.findByProjectAndUser as jest.Mock).mockResolvedValue({
      role: "manager",
    });

    (channelRepo.findByProjectAndName as jest.Mock).mockResolvedValue(null);
    (channelRepo.update as jest.Mock).mockImplementation(
      async (updatedChannel: Channel) => updatedChannel
    );

    const result = await useCase.execute({
      ...baseInput,
      channelName: "general-updated",
      description: "new description",
      visibleToRoles: ["manager"],
      permissionsByRole: {
        manager: "manager",
      },
    });

    expect(result.channelName).toBe("general-updated");
    expect(result.description).toBe("new description");
    expect(channelRepo.update).toHaveBeenCalledTimes(1);
  });

  // --------------------------------------------------
  //  Rename only when name changes
  // --------------------------------------------------

  it("should NOT check duplicate name if channel name is unchanged", async () => {
    (channelRepo.findById as jest.Mock).mockResolvedValue(channel);
    (membershipRepo.findByProjectAndUser as jest.Mock).mockResolvedValue({
      role: "manager",
    });

    (channelRepo.update as jest.Mock).mockImplementation(
      async (updatedChannel: Channel) => updatedChannel
    );

    await useCase.execute({
      ...baseInput,
      channelName: "general",
    });

    expect(channelRepo.findByProjectAndName).not.toHaveBeenCalled();
  });
});
