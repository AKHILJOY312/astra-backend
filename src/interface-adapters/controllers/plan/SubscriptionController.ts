// src/interfaces/http/controllers/subscription/SubscriptionController.ts
import { Request, Response } from "express";
import { UpgradeToPlanUseCase } from "@/application/use-cases/upgradetopremium/UpgradeToPlanUseCase";
import { GetUserLimitsUseCase } from "@/application/use-cases/upgradetopremium/GetUserLimitsUseCase";
import { GetAvailablePlansUseCase } from "@/application/use-cases/plan/user/GetAvailablePlansUseCase";
import { CapturePaymentUseCase } from "@/application/use-cases/upgradetopremium/CapturePaymentUseCase";
import { HTTP_STATUS } from "@/interface-adapters/http/constants/httpStatus";
import { SUB_MESSAGE } from "@/interface-adapters/http/constants/messages";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";

@injectable()
export class SubscriptionController {
  constructor(
    @inject(TYPES.UpgradeToPlanUseCase)
    private upgradeUseCase: UpgradeToPlanUseCase,
    @inject(TYPES.GetUserLimitsUseCase)
    private getLimitsUseCase: GetUserLimitsUseCase,
    @inject(TYPES.GetAvailablePlansUseCase)
    private getAvailablePlans: GetAvailablePlansUseCase,
    @inject(TYPES.CapturePaymentUseCase)
    private captureUseCase: CapturePaymentUseCase
  ) {}

  // GET /api/subscription/plans
  async getPlansToSubscribe(req: Request, res: Response) {
    try {
      const plans = await this.getAvailablePlans.execute();
      return res.json({ success: true, plans });
    } catch (err: any) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: err.message });
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
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: SUB_MESSAGE.PLAN_ID_REQUIRED });
    }

    try {
      const result = await this.upgradeUseCase.execute({ userId, planId });

      return res.json({
        success: true,
        message: SUB_MESSAGE.ORDER_CREATED,
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
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: err.message || SUB_MESSAGE.UPGRADE_FAILED,
      });
    }
  }

  async capture(req: Request, res: Response) {
    try {
      const result = await this.captureUseCase.execute(req.body);
      if (!result.success) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(result);
      }
      return res.json(result);
    } catch (err: any) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: err.message });
    }
  }
}
