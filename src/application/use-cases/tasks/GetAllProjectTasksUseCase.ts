import { IProjectRepository } from "@/application/ports/repositories/IProjectRepository";
import { ITaskRepository } from "@/application/ports/repositories/ITaskRepository";
import { IGetAllProjectTasksUseCase } from "@/application/ports/use-cases/task/interfaces";
import { TYPES } from "@/config/di/types";
import { inject, injectable } from "inversify";
import { Task } from "@/domain/entities/task/Task";
import { AllProjectTasksDTO } from "@/application/dto/task/taskDto";

//getting the daily number of the task compoeted for a month graph and camparing the progress etc
@injectable()
export class GetAllProjectTasksUseCase implements IGetAllProjectTasksUseCase {
  constructor(
    @inject(TYPES.TaskRepository) private _taskRepo: ITaskRepository,
    @inject(TYPES.ProjectRepository) private _projectRepo: IProjectRepository,
  ) {}

  async execute(userId: string): Promise<AllProjectTasksDTO> {
    const tasks = await this._taskRepo.findByAssignedTo(userId);

    if (tasks.length === 0) {
      return {
        overall: { totalTasks: 0, completionPercentage: 0 },
        projects: [],
      };
    }

    const projectIds = [...new Set(tasks.map((t) => t.projectId))];

    const projects = await Promise.all(
      projectIds.map(async (id) => {
        const project = await this._projectRepo.findById(id);
        return project ? { id: project.id, title: project.projectName } : null;
      }),
    );

    const validProjects = projects.filter(
      (p): p is NonNullable<typeof p> => p !== null,
    );

    const projectMap = new Map<string, string>(
      validProjects.map((p) => [p.id!, p.title]),
    );

    const grouped = new Map<string, Task[]>();

    for (const task of tasks) {
      const projId = task.projectId;
      if (!grouped.has(projId)) {
        grouped.set(projId, []);
      }
      grouped.get(projId)!.push(task);
    }

    const resultProjects = [];

    let globalTotal = 0;
    let globalDone = 0;

    for (const [projectId, projectTasks] of grouped.entries()) {
      const title = projectMap.get(projectId) ?? "Unknown Project";

      const total = projectTasks.length;
      const done = projectTasks.filter((t) => t.status === "done").length;
      const inprogress = projectTasks.filter(
        (t) => t.status === "inprogress",
      ).length;
      const todo = total - done - inprogress;

      const completion = total > 0 ? Math.round((done / total) * 100) : 0;

      globalTotal += total;
      globalDone += done;

      resultProjects.push({
        projectId,
        projectTitle: title,
        stats: {
          total,
          todo,
          inprogress,
          done,
          completionPercentage: completion,
        },
        tasks: projectTasks.map((t) => ({
          id: t.id!,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate ?? null,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          hasAttachments: t.hasAttachments,
        })),
      });
    }
    const overallCompletion =
      globalTotal > 0 ? Math.round((globalDone / globalTotal) * 100) : 0;
    resultProjects.sort((a, b) => a.projectTitle.localeCompare(b.projectTitle));

    return {
      overall: {
        totalTasks: globalTotal,
        completionPercentage: overallCompletion,
      },
      projects: resultProjects,
    };
  }
}
