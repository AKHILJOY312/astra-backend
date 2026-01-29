import { ContainerModule } from "inversify";
import { TYPES } from "../types"; // Adjust path if needed

import { AuthController } from "@/interface-adapters/controllers/auth/AuthController";
import { AdminAuthController } from "@/interface-adapters/controllers/auth/AdminAuthController";
import { AdminUserController } from "@/interface-adapters/controllers/user/AdminUserController";
import { PlanController } from "@/interface-adapters/controllers/plan/PlanController";
import { ProjectController } from "@/interface-adapters/controllers/project/ProjectController";
import { MemberController } from "@/interface-adapters/controllers/project/MemberController";
import { ChannelController } from "@/interface-adapters/controllers/channel/ChannelController";
import { SubscriptionController } from "@/interface-adapters/controllers/plan/SubscriptionController";
import { MessageController } from "@/interface-adapters/controllers/message/MessageController";
import { UserController } from "@/interface-adapters/controllers/user/UserController";
import { TaskController } from "@/interface-adapters/controllers/task/TaskController";
import { MemberSearchController } from "@/interface-adapters/controllers/task/MemberSearchController";
import { MeetingController } from "@/interface-adapters/controllers/meeting/MeetingController";

export const controllerModule = new ContainerModule((options) => {
  options.bind<AuthController>(TYPES.AuthController).to(AuthController);
  options
    .bind<AdminAuthController>(TYPES.AdminAuthController)
    .to(AdminAuthController);
  options
    .bind<AdminUserController>(TYPES.AdminUserController)
    .to(AdminUserController);
  options.bind<PlanController>(TYPES.PlanController).to(PlanController);
  options
    .bind<ProjectController>(TYPES.ProjectController)
    .to(ProjectController);
  options.bind<MemberController>(TYPES.MemberController).to(MemberController);
  options
    .bind<ChannelController>(TYPES.ChannelController)
    .to(ChannelController);
  options
    .bind<SubscriptionController>(TYPES.SubscriptionController)
    .to(SubscriptionController);
  options
    .bind<MessageController>(TYPES.MessageController)
    .to(MessageController);
  options.bind<UserController>(TYPES.UserController).to(UserController);
  options.bind<TaskController>(TYPES.TaskController).to(TaskController);
  options
    .bind<MemberSearchController>(TYPES.MemberSearchController)
    .to(MemberSearchController);
  options
    .bind<MeetingController>(TYPES.MeetingController)
    .to(MeetingController);
});
