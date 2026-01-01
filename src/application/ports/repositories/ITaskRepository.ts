import { IBaseRepository } from "./IBaseRepository";
import { TaskDTO } from "@/application/dto/task/taskDto";

export interface ITaskRepository extends IBaseRepository<TaskDTO> {
  findByProjectId(projectId: string): Promise<TaskDTO[]>;
}
