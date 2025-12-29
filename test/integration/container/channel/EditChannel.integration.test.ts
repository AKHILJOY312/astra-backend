// test/integration/container/channel/EditChannel.integration.test.ts
import "reflect-metadata";
import { container } from "@/config/container";
import { IEditChannelUseCase } from "@/application/ports/use-cases/channel/IEditChannelUseCase";
import { EditChannelDTO } from "@/application/dto/channel/channelDtos";
import { IChannelRepository } from "@/application/ports/repositories/IChannelRepository";
import { Channel } from "@/domain/entities/channel/Channel";

describe("EditChannelUseCase Integration", () => {
  let editChannelUseCase: IEditChannelUseCase;
  let channelRepo: IChannelRepository;

  beforeAll(() => {
    editChannelUseCase = container.get<IEditChannelUseCase>(
      "IEditChannelUseCase"
    );
    channelRepo = container.get<IChannelRepository>("IChannelRepository");
  });

  it("should edit a channel successfully", async () => {
    // Assume channel.id exists after setup
    const channel = { id: "test-channel-id", projectId: "project-id" };

    const input: EditChannelDTO = {
      channelId: channel.id!, // non-null assertion
      userId: "manager-id",
      channelName: "general-updated",
      description: "new description",
      visibleToRoles: ["manager", "member"],
      permissionsByRole: { manager: "manager", member: "view" },
    };

    const updated = (await editChannelUseCase.execute(input)) as Channel; // type assertion

    expect(updated.channelName).toBe("general-updated");
    expect(updated.description).toBe("new description");

    const fromDb = await channelRepo.findById(channel.id!); // non-null assertion
    expect(fromDb).toBeDefined();
    expect(fromDb?.channelName).toBe("general-updated");
  });
});
