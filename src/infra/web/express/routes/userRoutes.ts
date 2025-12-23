import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/types";
import { UserController } from "@/interface-adapters/controllers/user/UserController";
import { createProtectMiddleware } from "@/infra/web/express/middleware/protect";
import { API_ROUTES } from "@/config/routes.config";

export function getUserRoutes(container: Container): Router {
  const router = Router();
  const protect = container.get<ReturnType<typeof createProtectMiddleware>>(
    TYPES.ProtectMiddleware
  );

  const userController = container.get<UserController>(TYPES.UserController);
  router.use(protect);

  router
    .route(API_ROUTES.USERS.ME)
    .get(userController.getProfile.bind(userController))
    .patch(userController.updateProfile.bind(userController))
    .delete(userController.deleteAccount.bind(userController));

  return router;
}
