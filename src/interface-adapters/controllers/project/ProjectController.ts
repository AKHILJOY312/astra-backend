// src/interfaces/http/controllers/project/ProjectController.ts
import { Request, Response } from "express";
import { CreateProjectUseCase } from "../../../application/use-cases/project/CreateProjectUseCase";
import { z } from "zod";
import { GetUserProjectsUseCase } from "../../../application/use-cases/project/GetUserProjectsUseCase";
import { HTTP_STATUS } from "../../http/constants/httpStatus";
// import { ERROR_MESSAGES } from "@/interface-adapters/http/constants/messages";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { UpdateProjectUseCase } from "@/application/use-cases/project/UpdateProjectUseCase";
import { ValidationError } from "@/application/error/AppError";
import { asyncHandler } from "@/infra/web/express/handler/asyncHandler";
import { PROJECT_MESSAGE } from "@/interface-adapters/http/constants/messages";

const CreateProjectSchema = z.object({
  projectName: z.string().min(1).max(100),
  description: z.string().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

const UpdateProjectSchema = z.object({
  projectName: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(30).default(10),
  search: z.string().optional(),
});

@injectable()
export class ProjectController {
  constructor(
    @inject(TYPES.CreateProjectUseCase)
    private createProjectUseCase: CreateProjectUseCase,
    @inject(TYPES.GetUserProjectsUseCase)
    private getUserProjectsUseCase: GetUserProjectsUseCase,
    @inject(TYPES.UpdateProjectUseCase)
    private updateProjectUseCase: UpdateProjectUseCase
  ) {}

  createProject = asyncHandler(async (req: Request, res: Response) => {
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
      data: project.toJSON(),
    });
  });
  updateProject = asyncHandler(async (req: Request, res: Response) => {
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
  });

  getUserProjects = asyncHandler(async (req: Request, res: Response) => {
    const queryParsed = PaginationQuerySchema.safeParse(req.params);
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
  });
}
