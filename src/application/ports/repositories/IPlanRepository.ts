import { Plan } from "@/domain/entities/billing/Plan";
import { IBaseRepository } from "./IBaseRepository";

export interface IPlanRepository extends IBaseRepository<Plan> {
  // create(plan: Plan): Promise<Plan>;
  // update(plan: Plan): Promise<void>;
  // delete(id: string): Promise<Plan | null>;
  // findById(id: string): Promise<Plan | null>;

  findAllPaginated(page: number, limit: number): Promise<Plan[]>;
  count(): Promise<number>;
  findByName(name: string): Promise<Plan | null>;
  findAllActive(): Promise<Plan[]>;
}
