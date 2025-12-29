import { Channel } from "@/domain/entities/channel/Channel";

export interface CreateChannelDTO {
  projectId: string;
  channelName: string;
  description?: string;
  createdBy: string;

  visibleToRoles: string[];
  permissionsByRole: Record<string, "view" | "message" | "manager">;
}
export interface CreateChannelResponseDTO {
  id?: string;
  projectId: string;
  channelName: string;
  description?: string;
  createdBy: string;
  visibleToRoles: string[];
  permissionsByRole: Record<string, "view" | "message" | "manager">;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface CreateChannelResultDTO {
  channel: Channel;
}

export interface EditChannelDTO {
  channelId: string;
  userId: string;
  channelName?: string;
  description?: string;
  visibleToRoles?: string[];
  permissionsByRole?: Record<string, "view" | "message" | "manager">;
}
