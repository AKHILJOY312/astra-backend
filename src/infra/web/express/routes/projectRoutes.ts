import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/types";
import { ProjectController } from "@/interface-adapters/controllers/project/ProjectController";
import { MemberController } from "@/interface-adapters/controllers/project/MemberController";
import { createProtectMiddleware } from "@/infra/web/express/middleware/protect";
import { API_ROUTES } from "@/config/routes.config";

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
    .post(projectController.createProject.bind(projectController))
    .get(projectController.getUserProjects.bind(projectController));

  router.patch(
    API_ROUTES.PROJECTS.BY_ID,
    projectController.updateProject.bind(projectController)
  );

  router
    .route(API_ROUTES.PROJECTS.MEMBERS)
    .post(memberController.addMember.bind(memberController))
    .get(memberController.listMembers.bind(memberController));

  router.delete(
    API_ROUTES.PROJECTS.BY_MEMBER_ID,
    memberController.removeMember.bind(memberController)
  );
  router.patch(
    API_ROUTES.PROJECTS.MEMBER_ROLE,
    memberController.changeRole.bind(memberController)
  );

  return router;
}
