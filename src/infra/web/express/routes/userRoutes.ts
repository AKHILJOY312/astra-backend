import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/types";
import { UserController } from "@/interface-adapters/controllers/user/UserController";
import { createProtectMiddleware } from "@/infra/web/express/middleware/protect";

export function getUserRoutes(container: Container): Router {
  const router = Router();
  const protect = container.get<ReturnType<typeof createProtectMiddleware>>(
    TYPES.ProtectMiddleware
  );

  const userController = container.get<UserController>(TYPES.UserController);
  router.use(protect);
  router.get("/me", userController.getProfile.bind(userController));
  router.patch("/me", userController.updateProfile.bind(userController));
  router.delete("/me", userController.deleteAccount.bind(userController));

  return router;
}
