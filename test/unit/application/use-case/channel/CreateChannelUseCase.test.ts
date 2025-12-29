import { CreateChannelUseCase } from "@/application/use-cases/channel/CreateChannelUseCase";
import {
  UnauthorizedError,
  BadRequestError,
} from "@/application/error/AppError";
import { Channel } from "@/domain/entities/channel/Channel";
import type { IChannelRepository } from "@/application/ports/repositories/IChannelRepository";
import type { IProjectMembershipRepository } from "@/application/ports/repositories/IProjectMembershipRepository";
import type { CreateChannelDTO } from "@/application/dto/channel/channelDtos";

describe("CreateChannelUseCase (Unit)", () => {
  let channelRepo: Partial<IChannelRepository>;
  let membershipRepo: Partial<IProjectMembershipRepository>;
  let useCase: CreateChannelUseCase;

  const baseInput: CreateChannelDTO = {
    projectId: "project-1",
    channelName: "general",
    description: "Main channel",
    createdBy: "user-1",
    visibleToRoles: ["manager", "member"],
    permissionsByRole: {
      manager: "manager",
      member: "view",
    },
  };

  beforeEach(() => {
    channelRepo = {
      findByProjectAndName: jest.fn(),
      create: jest.fn(),
    };

    membershipRepo = {
      findByProjectAndUser: jest.fn(),
    };

    useCase = new CreateChannelUseCase(
      channelRepo as IChannelRepository,
      membershipRepo as IProjectMembershipRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should throw UnauthorizedError if membership not found", async () => {
    (membershipRepo.findByProjectAndUser as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute(baseInput)).rejects.toBeInstanceOf(
      UnauthorizedError
    );
  });

  it("should throw UnauthorizedError if user is not manager", async () => {
    (membershipRepo.findByProjectAndUser as jest.Mock).mockResolvedValue({
      role: "member",
    });

    await expect(useCase.execute(baseInput)).rejects.toBeInstanceOf(
      UnauthorizedError
    );
  });

  it("should throw BadRequestError if channel name already exists", async () => {
    (membershipRepo.findByProjectAndUser as jest.Mock).mockResolvedValue({
      role: "manager",
    });

    (channelRepo.findByProjectAndName as jest.Mock).mockResolvedValue(
      {} as Channel
    );

    await expect(useCase.execute(baseInput)).rejects.toBeInstanceOf(
      BadRequestError
    );
  });

  it("should create channel successfully", async () => {
    (membershipRepo.findByProjectAndUser as jest.Mock).mockResolvedValue({
      role: "manager",
    });

    (channelRepo.findByProjectAndName as jest.Mock).mockResolvedValue(null);

    (channelRepo.create as jest.Mock).mockImplementation(
      async (channel: Channel) => channel
    );

    const result = await useCase.execute(baseInput);

    expect(result.channel).toBeInstanceOf(Channel);
    expect(result.channel.channelName).toBe("general");
    expect(channelRepo.create).toHaveBeenCalledTimes(1);
  });
  //   it("INTENTIONAL FAILURE: should not create channel", async () => {
  //     (membershipRepo.findByProjectAndUser as jest.Mock).mockResolvedValue({
  //       role: "manager",
  //     });

  //     (channelRepo.findByProjectAndName as jest.Mock).mockResolvedValue(null);

  //     (channelRepo.create as jest.Mock).mockImplementation(
  //       async (channel: Channel) => channel
  //     );

  //     const result = await useCase.execute(baseInput);

  //     //  This is intentionally wrong
  //     expect(result.channel.channelName).toBe("random");
  //   });
  it("should not allow duplicate channel names case-insensitively", async () => {
    (membershipRepo.findByProjectAndUser as jest.Mock).mockResolvedValue({
      role: "manager",
    });

    (channelRepo.findByProjectAndName as jest.Mock).mockResolvedValue(
      {} as Channel
    );

    await expect(
      useCase.execute({
        ...baseInput,
        channelName: "General",
      })
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it("should trim channel name before saving", async () => {
    (membershipRepo.findByProjectAndUser as jest.Mock).mockResolvedValue({
      role: "manager",
    });

    (channelRepo.findByProjectAndName as jest.Mock).mockResolvedValue(null);

    (channelRepo.create as jest.Mock).mockImplementation(
      async (channel: Channel) => channel
    );

    const result = await useCase.execute({
      ...baseInput,
      channelName: "   general   ",
    });

    expect(result.channel.channelName).toBe("general");
  });
});
