// src/interfaces/http/controllers/subscription/SubscriptionController.ts
import { Request, Response } from "express";
import {
  PLAN_MESSAGES,
  PROJECT_MESSAGE,
  SUB_MESSAGE,
} from "@/interface-adapters/http/constants/messages";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { BadRequestError, ValidationError } from "@/application/error/AppError";

import { IUpgradeToPlanUseCase } from "@/application/ports/use-cases/upgradetopremium/IUpgradeToPlanUseCase";
import { IGetUserLimitsUseCase } from "@/application/ports/use-cases/upgradetopremium/IGetUserLimitsUseCase";
import { IGetAvailablePlansUseCase } from "@/application/ports/use-cases/plan/user/IGetAvailablePlansUseCase";
import { ICapturePaymentUseCase } from "@/application/ports/use-cases/upgradetopremium/ICapturePaymentUseCase";
import { IGetUserBillingHistoryUseCase } from "@/application/ports/use-cases/upgradetopremium/IGetUserBillingHistoryUseCase ";
import { PaginationQuerySchema } from "@/interface-adapters/http/validators/projectValidators";

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
    private captureUseCase: ICapturePaymentUseCase,
    @inject(TYPES.GetUserBillingUseCase)
    private paymentHistoryUC: IGetUserBillingHistoryUseCase
  ) {}

  // GET /api/subscription/plans
  getPlansToSubscribe = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const plans = await this.getAvailablePlans.execute(userId);
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
  paymentHistory = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const queryParsed = PaginationQuerySchema.safeParse(req.query);
    if (!queryParsed.success) {
      throw new ValidationError(PROJECT_MESSAGE.INVALID_DATA);
    }
    const { page, limit, search } = queryParsed.data;

    const data = await this.paymentHistoryUC.execute(
      userId!,
      page ? Number(page) : 1,
      limit ? Number(limit) : 5,
      search ? String(search) : undefined
    );
    return res.json(data);
  };
}
