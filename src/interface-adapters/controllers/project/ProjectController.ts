// src/interfaces/http/controllers/project/ProjectController.ts
import { Request, Response } from "express";
import { CreateProjectUseCase } from "../../../application/use-cases/project/CreateProjectUseCase";
import { z } from "zod";
import { GetUserProjectsUseCase } from "../../../application/use-cases/project/GetUserProjectsUseCase";
import { HTTP_STATUS } from "../../http/constants/httpStatus";
import { ERROR_MESSAGES } from "@/interface-adapters/http/constants/messages";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";

@injectable()
export class ProjectController {
  constructor(
    @inject(TYPES.CreateProjectUseCase)
    private createProjectUseCase: CreateProjectUseCase,
    @inject(TYPES.GetUserProjectsUseCase)
    private getUserProjectsUseCase: GetUserProjectsUseCase
  ) {}

  async createProject(req: Request, res: Response) {
    const schema = z.object({
      projectName: z.string().min(1).max(100),
      description: z.string().optional(),
      imageUrl: z.string().url().nullable().optional(),
    });

    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: result.error.format() });
    }

    const { projectName, description, imageUrl } = result.data;
    const ownerId = req.user!.id;

    try {
      const { project } = await this.createProjectUseCase.execute({
        projectName,
        description,
        imageUrl,
        ownerId,
      });

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: project.toJSON(),
      });
    } catch (err: any) {
      if (err.message.includes("limit")) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          error: err.message,
          upgradeRequired: true,
        });
      }
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: err.message });
    }
  }

  async getUserProjects(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const { projects } = await this.getUserProjectsUseCase.execute({
        userId,
      });

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: projects.map((p) => p.toJSON()),
      });
    } catch (err: any) {
      console.error(err);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: ERROR_MESSAGES.FAILED_FETCH });
    }
  }
}
