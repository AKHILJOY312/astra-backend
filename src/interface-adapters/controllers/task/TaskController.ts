import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { HTTP_STATUS } from "@/interface-adapters/http/constants/httpStatus";
import { ValidationError } from "@/application/error/AppError";
import {
  IAddCommentUseCase,
  ICreateTaskUseCase,
  IDeleteTaskUseCase,
  IGetAllProjectTasksUseCase,
  IGetAttachmentUploadUrlUseCase,
  IGetProjectTasksUseCase,
  IUpdateTaskStatusUseCase,
  IUpdateTaskUseCase,
} from "@/application/ports/use-cases/task/interfaces";
import {
  CreateTaskSchema,
  UpdateTaskStatusSchema,
  ListTasksQuerySchema,
  AttachmentUploadSchema,
  UpdateTaskSchema,
  AddCommentSchema,
} from "@/interface-adapters/http/validators/taskValidators";

@injectable()
export class TaskController {
  constructor(
    @inject(TYPES.CreateTaskUseCase)
    private _createTaskUC: ICreateTaskUseCase,

    @inject(TYPES.DeleteTaskUseCase)
    private _deleteTaskUC: IDeleteTaskUseCase,

    @inject(TYPES.GetProjectTasksUseCase)
    private _listTasksUC: IGetProjectTasksUseCase,

    @inject(TYPES.UpdateTaskStatusUseCase)
    private _updateStatusUC: IUpdateTaskStatusUseCase,

    @inject(TYPES.GetAttachmentUploadUrlUseCase)
    private _attachmentUploadUC: IGetAttachmentUploadUrlUseCase,

    @inject(TYPES.UpdateTaskUseCase) private _updateTaskUC: IUpdateTaskUseCase,
    @inject(TYPES.AddCommentUseCase) private _addCommentUC: IAddCommentUseCase,
    @inject(TYPES.GetAllProjectTasksUseCase)
    private _getAllTaskUC: IGetAllProjectTasksUseCase,
  ) {}

  // POST /projects/:projectId/tasks
  createTask = async (req: Request, res: Response) => {
    const parsed = CreateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid task data");
    }

    const { projectId } = req.params;
    const managerId = req.user!.id;

    const task = await this._createTaskUC.execute(
      {
        projectId,
        ...parsed.data,
      },
      managerId,
    );

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: task,
    });
  };

  updateTask = async (req: Request, res: Response) => {
    const parsedBody = UpdateTaskSchema.safeParse(req.body);
    console.log(parsedBody.error);
    if (!parsedBody.success) {
      throw new ValidationError("Invalid request body parameters");
    }
    const { taskId } = req.params;
    const managerId = req.user!.id;
    const result = await this._updateTaskUC.execute(
      taskId,
      parsedBody.data,
      managerId,
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  };

  // GET /projects/:projectId/tasks
  listTasks = async (req: Request, res: Response) => {
    console.log("req. for the list task details ", req.query);
    const parsedQuery = ListTasksQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      throw new ValidationError("Invalid query parameters");
    }

    const { projectId } = req.params;
    const requesterId = req.user!.id;
    const { status, cursor, limit } = parsedQuery.data;
    const result = await this._listTasksUC.execute({
      projectId,
      requesterId,
      status,
      cursor,
      limit,
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  };

  // DELETE /tasks/:taskId
  deleteTask = async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const requestedBy = req.user!.id;

    await this._deleteTaskUC.execute(taskId, requestedBy);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Task deleted successfully",
    });
  };

  // PATCH /tasks/:taskId/status
  updateTaskStatus = async (req: Request, res: Response) => {
    const parsed = UpdateTaskStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid status");
    }

    const { taskId } = req.params;
    const requestedBy = req.user!.id;

    const task = await this._updateStatusUC.execute(
      taskId,
      parsed.data,
      requestedBy,
    );

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: task,
    });
  };

  // POST /projects/:projectId/tasks/attachments/upload-url
  getAttachmentUploadUrl = async (req: Request, res: Response) => {
    const parsed = AttachmentUploadSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid attachment data");
    }

    const { projectId } = req.params;
    const requesterId = req.user!.id;

    const result = await this._attachmentUploadUC.execute(
      projectId,
      parsed.data.fileName,
      parsed.data.fileType,
      requesterId,
    );

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  };

  addCommentToTask = async (req: Request, res: Response) => {
    const parsed = AddCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid attachment data");
    }

    const { projectId, taskId } = req.params;
    const requesterId = req.user!.id;
    const { message } = parsed.data;
    const input = {
      taskId,
      projectId,
      message,
    };
    const result = await this._addCommentUC.execute(input, requesterId);
    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: result,
    });
  };
  listAllTaskPerProject = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const result = await this._getAllTaskUC.execute(userId!);

    return res.json({
      success: true,
      data: result,
    });
  };
}
