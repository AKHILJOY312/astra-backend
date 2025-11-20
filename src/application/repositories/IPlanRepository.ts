import { Plan } from "../../domain/entities/billing/Plan";

export interface IPlanRepository {
  create(plan: Plan): Promise<Plan>;
  update(plan: Plan): Promise<void>;
  delete(id: string): Promise<Plan | null>;
  findById(id: string): Promise<Plan | null>;
  findAllPaginated(page: number, limit: number): Promise<Plan[]>;
  count(): Promise<number>;
}
