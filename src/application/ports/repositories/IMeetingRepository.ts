import { Meeting } from "@/domain/entities/meeting/Meeting";
import { IBaseRepository } from "./IBaseRepository";

export interface IMeetingRepository extends IBaseRepository<Meeting> {
  findByCode(code: string): Promise<Meeting | null>;
  findActiveByCode(code: string): Promise<Meeting | null>;
  countActive(): Promise<number>;
}
