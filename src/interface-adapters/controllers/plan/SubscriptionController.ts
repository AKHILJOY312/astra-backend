// src/interfaces/http/controllers/subscription/SubscriptionController.ts
import { Request, Response } from "express";
import { UpgradeSubscriptionUseCase } from "../../../application/use-cases/upgradetopremium/UpgradeSubscriptionUseCase";
import { GetUserLimitsUseCase } from "../../../application/use-cases/upgradetopremium/GetUserLimitsUseCase";

export class SubscriptionController {
  constructor(
    private upgradeUseCase: UpgradeSubscriptionUseCase,
    private getLimitsUseCase: GetUserLimitsUseCase
  ) {}

  async getLimits(req: Request, res: Response) {
    const userId = req.user!.id;
    const projectId = req.query.projectId as string | undefined;

    const limits = await this.getLimitsUseCase.execute(userId, projectId);

    return res.json({
      success: true,
      data: limits,
    });
  }

  async upgrade(req: Request, res: Response) {
    const { planId, paymentIntent } = req.body; // from Stripe webhook or client
    const userId = req.user!.id;

    // Validate planId exists & is active (via PlanRepo)

    try {
      const { subscription } = await this.upgradeUseCase.execute({
        userId,
        newPlanId: planId,
        amount: 999, // from plan
        currency: "USD",
        stripeSubscriptionId: paymentIntent?.id,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      return res.json({
        success: true,
        message: "Upgraded successfully",
        data: subscription.toJSON(),
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
