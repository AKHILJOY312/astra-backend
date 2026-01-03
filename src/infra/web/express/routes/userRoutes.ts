import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/types";
import { UserController } from "@/interface-adapters/controllers/user/UserController";
import { createProtectMiddleware } from "@/infra/web/express/middleware/protect";
import { API_ROUTES } from "@/config/routes.config";
import { asyncHandler } from "../handler/asyncHandler";

export function getUserRoutes(container: Container): Router {
  const router = Router();
  const protect = container.get<ReturnType<typeof createProtectMiddleware>>(
    TYPES.ProtectMiddleware
  );

  const userController = container.get<UserController>(TYPES.UserController);
  router.use(protect);

  router
    .route(API_ROUTES.USER.ME)
    .get(asyncHandler(userController.getProfile))
    .patch(asyncHandler(userController.updateName))
    .delete(asyncHandler(userController.deleteAccount));

  router
    .route(API_ROUTES.USER.PROFILE_IMAGE_URL)
    .post(asyncHandler(userController.getPresignedUrl));
  router
    .route(API_ROUTES.USER.PROFILE_IMAGE)
    .patch(asyncHandler(userController.saveProfileImage));

  router
    .route(API_ROUTES.USER.CHANGE_PASSWORD)
    .patch(asyncHandler(userController.changePassword));
  return router;
}
