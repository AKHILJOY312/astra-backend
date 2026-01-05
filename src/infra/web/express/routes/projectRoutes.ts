import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/types";
import { ProjectController } from "@/interface-adapters/controllers/project/ProjectController";
import { MemberController } from "@/interface-adapters/controllers/project/MemberController";
import { createProtectMiddleware } from "@/infra/web/express/middleware/protect";
import { API_ROUTES } from "@/config/routes.config";
import { asyncHandler } from "../handler/asyncHandler";

export function getProjectRoutes(container: Container): Router {
  const router = Router();

  const projectController = container.get<ProjectController>(
    TYPES.ProjectController
  );
  const memberController = container.get<MemberController>(
    TYPES.MemberController
  );
  const protect = container.get<ReturnType<typeof createProtectMiddleware>>(
    TYPES.ProtectMiddleware
  );

  router.use(protect);

  router
    .route(API_ROUTES.PROJECTS.BASE)
    .post(asyncHandler(projectController.createProject.bind(projectController)))
    .get(projectController.getUserProjects.bind(projectController));

  router.patch(
    API_ROUTES.PROJECTS.BY_ID,
    asyncHandler(projectController.updateProject.bind(projectController))
  );

  router
    .route(API_ROUTES.PROJECTS.MEMBERS)
    .post(asyncHandler(memberController.addMember.bind(memberController)))
    .get(asyncHandler(memberController.listMembers.bind(memberController)));

  router
    .route(API_ROUTES.PROJECTS.INVITATION_ACCEPT)
    .post(
      asyncHandler(memberController.acceptInvitation.bind(memberController))
    );

  router.delete(
    API_ROUTES.PROJECTS.BY_MEMBER_ID,
    asyncHandler(memberController.removeMember.bind(memberController))
  );

  router.patch(
    API_ROUTES.PROJECTS.MEMBER_ROLE,
    asyncHandler(memberController.changeRole.bind(memberController))
  );

  return router;
}
