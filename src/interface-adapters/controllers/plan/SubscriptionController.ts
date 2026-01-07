// src/interfaces/http/controllers/subscription/SubscriptionController.ts
import { Request, Response } from "express";
import {
  PLAN_MESSAGES,
  SUB_MESSAGE,
} from "@/interface-adapters/http/constants/messages";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { BadRequestError } from "@/application/error/AppError";

import { IUpgradeToPlanUseCase } from "@/application/ports/use-cases/upgradetopremium/IUpgradeToPlanUseCase";
import { IGetUserLimitsUseCase } from "@/application/ports/use-cases/upgradetopremium/IGetUserLimitsUseCase";
import { IGetAvailablePlansUseCase } from "@/application/ports/use-cases/plan/user/IGetAvailablePlansUseCase";
import { ICapturePaymentUseCase } from "@/application/ports/use-cases/upgradetopremium/ICapturePaymentUseCase";

@injectable()
export class SubscriptionController {
  constructor(
    @inject(TYPES.UpgradeToPlanUseCase)
    private upgradeUseCase: IUpgradeToPlanUseCase,
    @inject(TYPES.GetUserLimitsUseCase)
    private getLimitsUseCase: IGetUserLimitsUseCase,
    @inject(TYPES.GetAvailablePlansUseCase)
    private getAvailablePlans: IGetAvailablePlansUseCase,
    @inject(TYPES.CapturePaymentUseCase)
    private captureUseCase: ICapturePaymentUseCase
  ) {}

  // GET /api/subscription/plans
  getPlansToSubscribe = async (req: Request, res: Response) => {
    const plans = await this.getAvailablePlans.execute();
    return res.json({ success: true, plans });
  };

  // GET /api/subscription/limits
  getLimits = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const projectId = req.query.projectId as string | undefined;
    const limits = await this.getLimitsUseCase.execute(userId, projectId);
    return res.json({ success: true, data: limits });
  };

  // POST /api/subscription/upgrade
  upgrade = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { planId } = req.body;

    if (!planId) {
      throw new BadRequestError(PLAN_MESSAGES.ID_NEEDED);
    }

    const result = await this.upgradeUseCase.execute({ userId, planId });

    return res.json({
      success: true,
      message: SUB_MESSAGE.ORDER_CREATED,
      data: {
        // subscription: result.subscription.toJSON(),
        razorpayOrderId: result.razorpayOrderId,
        amount: result.amount,
        currency: result.currency,
        keyId: result.keyId,
      },
    });
  };

  capture = async (req: Request, res: Response) => {
    const result = await this.captureUseCase.execute(req.body);
    if (!result.success) {
      throw new BadRequestError(result.message);
    }
    return res.json(result);
  };
}
