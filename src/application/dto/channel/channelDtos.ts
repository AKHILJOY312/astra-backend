import { Channel } from "@/domain/entities/channel/Channel";

export interface CreateChannelDTO {
  projectId: string;
  channelName: string;
  description?: string;
  createdBy: string;

  visibleToRoles: string[];
  permissionsByRole: Record<string, "view" | "message" | "manager">;
}

export interface CreateChannelResultDTO {
  channel: Channel;
}
