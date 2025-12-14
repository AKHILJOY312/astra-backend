import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/types";
import { ProjectController } from "@/interface-adapters/controllers/project/ProjectController";
import { MemberController } from "@/interface-adapters/controllers/project/MemberController";
import { createProtectMiddleware } from "@/infra/middleware/protect";

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

  router.post("/", projectController.createProject.bind(projectController));

  router.get(
    "/",

    projectController.getUserProjects.bind(projectController)
  );

  router.post(
    "/:projectId/members",
    memberController.addMember.bind(memberController)
  );
  router.delete(
    "/:projectId/members/:memberId",
    memberController.removeMember.bind(memberController)
  );
  router.patch(
    "/:projectId/members/:memberId/role",
    memberController.changeRole.bind(memberController)
  );

  return router;
}
