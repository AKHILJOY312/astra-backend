// src/interfaces/http/controllers/subscription/SubscriptionController.ts
import { Request, Response } from "express";
import { UpgradeToPlanUseCase } from "@/application/use-cases/upgradetopremium/UpgradeToPlanUseCase";
import { GetUserLimitsUseCase } from "@/application/use-cases/upgradetopremium/GetUserLimitsUseCase";
import { GetAvailablePlansUseCase } from "@/application/use-cases/plan/user/GetAvailablePlansUseCase";
import { CapturePaymentUseCase } from "@/application/use-cases/upgradetopremium/CapturePaymentUseCase";

export class SubscriptionController {
  constructor(
    private upgradeUseCase: UpgradeToPlanUseCase,
    private getLimitsUseCase: GetUserLimitsUseCase,
    private getAvailablePlans: GetAvailablePlansUseCase,
    private captureUseCase: CapturePaymentUseCase
  ) {}

  // GET /api/subscription/plans
  async getPlansToSubscribe(req: Request, res: Response) {
    try {
      const plans = await this.getAvailablePlans.execute();
      return res.json({ success: true, plans });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/subscription/limits
  async getLimits(req: Request, res: Response) {
    const userId = req.user!.id;
    const projectId = req.query.projectId as string | undefined;
    const limits = await this.getLimitsUseCase.execute(userId, projectId);
    return res.json({ success: true, data: limits });
  }

  // POST /api/subscription/upgrade
  async upgrade(req: Request, res: Response) {
    const userId = req.user!.id;
    const { planId } = req.body;

    if (!planId) {
      return res
        .status(400)
        .json({ success: false, message: "planId is required" });
    }

    try {
      const result = await this.upgradeUseCase.execute({ userId, planId });

      return res.json({
        success: true,
        message: "Order created successfully",
        data: {
          subscription: result.subscription.toJSON(),
          razorpayOrderId: result.razorpayOrderId,
          amount: result.amount,
          currency: result.currency,
          keyId: result.keyId,
        },
      });
    } catch (err: any) {
      console.log("error: ", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Upgrade failed",
      });
    }
  }

  async capture(req: Request, res: Response) {
    try {
      const result = await this.captureUseCase.execute(req.body);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
