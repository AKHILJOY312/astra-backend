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
    .get(asyncHandler(userController.getProfile.bind(userController)))
    .patch(asyncHandler(userController.updateProfile.bind(userController)))
    .delete(asyncHandler(userController.deleteAccount.bind(userController)));

  router
    .route(API_ROUTES.USER.PROFILE_IMAGE_URL)
    .post(asyncHandler(userController.getPresignedUrl.bind(userController)));
  router
    .route(API_ROUTES.USER.PROFILE_IMAGE)
    .patch(asyncHandler(userController.saveProfileImage.bind(userController)));
  return router;
}
