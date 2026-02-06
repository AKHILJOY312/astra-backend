import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/di/types";
import { ProjectController } from "@/interface-adapters/controllers/project/ProjectController";
import { MemberController } from "@/interface-adapters/controllers/project/MemberController";
import { createProtectMiddleware } from "@/infra/web/express/middleware/protect";
import { API_ROUTES } from "@/config/routes.config";
import { asyncHandler } from "../handler/asyncHandler";
import { TaskController } from "@/interface-adapters/controllers/task/TaskController";
import { MemberSearchController } from "@/interface-adapters/controllers/task/MemberSearchController";

export function getProjectRoutes(container: Container): Router {
  const router = Router();

  const projectController = container.get<ProjectController>(
    TYPES.ProjectController,
  );
  const memberController = container.get<MemberController>(
    TYPES.MemberController,
  );
  const taskController = container.get<TaskController>(TYPES.TaskController);
  const searchController = container.get<MemberSearchController>(
    TYPES.MemberSearchController,
  );

  const protect = container.get<ReturnType<typeof createProtectMiddleware>>(
    TYPES.ProtectMiddleware,
  );

  router.use(protect);

  router
    .route(API_ROUTES.PROJECTS.BASE)
    .post(asyncHandler(projectController.createProject.bind(projectController)))
    .get(projectController.getUserProjects.bind(projectController));

  router
    .route(API_ROUTES.PROJECTS.BY_ID)
    .patch(
      asyncHandler(projectController.updateProject.bind(projectController)),
    );

  router
    .route(API_ROUTES.PROJECTS.MEMBERS)
    .post(asyncHandler(memberController.addMember.bind(memberController)))
    .get(asyncHandler(memberController.listMembers.bind(memberController)));

  router
    .route(API_ROUTES.PROJECTS.INVITATION_ACCEPT)
    .post(
      asyncHandler(memberController.acceptInvitation.bind(memberController)),
    );

  router
    .route(API_ROUTES.PROJECTS.BY_MEMBER_ID)
    .delete(asyncHandler(memberController.removeMember.bind(memberController)));

  router
    .route(API_ROUTES.PROJECTS.MEMBER_ROLE)
    .patch(asyncHandler(memberController.changeRole.bind(memberController)));

  //Tasks
  router
    .route(API_ROUTES.PROJECTS.TASKS.ROOT)
    .post(asyncHandler(taskController.createTask))
    .get(asyncHandler(taskController.listTasks));

  router
    .route(API_ROUTES.PROJECTS.TASKS.ATTACHMENT_UPLOAD)
    .post(asyncHandler(taskController.getAttachmentUploadUrl));

  router
    .route(API_ROUTES.PROJECTS.TASKS.MEMBERS_SEARCH)
    .get(asyncHandler(searchController.searchMembers));

  router
    .route(API_ROUTES.PROJECTS.TASKS.BY_ID)
    .patch(asyncHandler(taskController.updateTask))
    .delete(asyncHandler(taskController.deleteTask));
  router
    .route(API_ROUTES.PROJECTS.TASKS.STATUS)
    .patch(asyncHandler(taskController.updateTaskStatus));
  router
    .route(API_ROUTES.PROJECTS.TASKS.COMMENT)
    .post(asyncHandler(taskController.addCommentToTask));

  router
    .route(API_ROUTES.PROJECTS.TASKS.GET_ALL_TASKS)
    .get(asyncHandler(taskController.listAllTaskPerProject));

  return router;
}
