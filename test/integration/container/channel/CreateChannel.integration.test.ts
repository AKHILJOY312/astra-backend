// test/integration/container/channel/CreateChannel.integration.test.ts
import "reflect-metadata";
import { container } from "@/config/container";
import { ICreateChannelUseCase } from "@/application/ports/use-cases/channel/ICreateChannelUseCase";
import { CreateChannelDTO } from "@/application/dto/channel/channelDtos";
import { IChannelRepository } from "@/application/ports/repositories/IChannelRepository";

describe("CreateChannelUseCase Integration", () => {
  let createChannelUseCase: ICreateChannelUseCase;
  let channelRepo: IChannelRepository;

  beforeAll(() => {
    createChannelUseCase = container.get<ICreateChannelUseCase>(
      "ICreateChannelUseCase"
    );
    channelRepo = container.get<IChannelRepository>("IChannelRepository");
  });

  it("should create a channel successfully", async () => {
    // Assume project.id exists after setup
    const project = { id: "test-project-id" };

    const input: CreateChannelDTO = {
      projectId: project.id!, // non-null assertion
      channelName: "general",
      description: "General channel",
      createdBy: "user-id",
      visibleToRoles: ["manager", "member"],
      permissionsByRole: { manager: "manager", member: "view" },
    };

    const result = await createChannelUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.channelName).toBe("general");

    // Check in DB
    const saved = await channelRepo.findByProjectAndName(
      project.id!,
      "general"
    ); // non-null assertion
    expect(saved).toBeDefined();
    expect(saved?.channelName).toBe("general");
  });
});
