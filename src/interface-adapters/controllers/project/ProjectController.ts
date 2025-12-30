// src/interfaces/http/controllers/project/ProjectController.ts
import { Request, Response } from "express";
import { HTTP_STATUS } from "../../http/constants/httpStatus";
// import { ERROR_MESSAGES } from "@/interface-adapters/http/constants/messages";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { ValidationError } from "@/application/error/AppError";
import { PROJECT_MESSAGE } from "@/interface-adapters/http/constants/messages";
import {
  CreateProjectSchema,
  PaginationQuerySchema,
  UpdateProjectSchema,
} from "@/interface-adapters/http/validators/projectValidators";
import { ICreateProjectUseCase } from "@/application/ports/use-cases/project/ICreateProjectUseCase";
import { IGetUserProjectsUseCase } from "@/application/ports/use-cases/project/IGetUserProjectsUseCase";
import { IUpdateProjectUseCase } from "@/application/ports/use-cases/project/IUpdateProjectUseCase";

@injectable()
export class ProjectController {
  constructor(
    @inject(TYPES.CreateProjectUseCase)
    private createProjectUseCase: ICreateProjectUseCase,
    @inject(TYPES.GetUserProjectsUseCase)
    private getUserProjectsUseCase: IGetUserProjectsUseCase,
    @inject(TYPES.UpdateProjectUseCase)
    private updateProjectUseCase: IUpdateProjectUseCase
  ) {}

  createProject = async (req: Request, res: Response) => {
    const result = CreateProjectSchema.safeParse(req.body);

    if (!result.success) {
      throw new ValidationError(PROJECT_MESSAGE.INVALID_DATA);
    }

    const { projectName, description, imageUrl } = result.data;
    const ownerId = req.user!.id;

    const { project } = await this.createProjectUseCase.execute({
      projectName,
      description,
      imageUrl,
      ownerId,
    });

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      project: project.toJSON(),
    });
  };
  updateProject = async (req: Request, res: Response) => {
    const result = UpdateProjectSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(PROJECT_MESSAGE.INVALID_DATA);
    }

    const { projectId } = req.params;
    const userId = req.user!.id;

    const { project } = await this.updateProjectUseCase.execute({
      projectId,
      userId,
      ...result.data,
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: project.toJSON(),
    });
  };

  getUserProjects = async (req: Request, res: Response) => {
    const queryParsed = PaginationQuerySchema.safeParse(req.query);
    if (!queryParsed.success) {
      throw new ValidationError(PROJECT_MESSAGE.INVALID_DATA);
    }
    const { page, limit, search } = queryParsed.data;
    const userId = req.user!.id;

    const result = await this.getUserProjectsUseCase.execute({
      userId,
      page,
      limit,
      search,
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result.projects.map((p) => p.toJSON()),
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      totalCount: result.totalCount,
    });
  };
}
