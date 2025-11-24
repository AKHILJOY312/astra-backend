// src/interfaces/http/routes/planRoutes.ts
import { Router } from "express";
import { planController } from "../../../../config/container";
import { protect } from "../../../../config/container";
import { adminOnly } from "../../../../infra/middleware/adminOnly";

const router = Router();
router.use((req, res, next) => {
  console.log(" Router HIT:", req.method, req.originalUrl);
  next();
});

router.use(protect, adminOnly);

router.post("/", planController.create);
router.get("/", planController.getAll);
router.put("/:id", planController.update);
router.delete("/:id", planController.delete);

export default router;
