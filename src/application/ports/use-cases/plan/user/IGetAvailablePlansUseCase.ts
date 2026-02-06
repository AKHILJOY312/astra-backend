// export interface PlanResponseDTO {
//   id: string;
//   name: string;
//   description?: string;
//   price: number;
//   finalAmount: number;
//   currency: string;
//   billingCycle: "monthly" | "yearly"; // adjust if you have more options
//   features: string[];
//   maxProjects: number;
//   maxMembersPerProject: number;
//   isActive: boolean;
//   // isDeleted is usually not exposed for available/public plans
//   createdAt: Date;
//   updatedAt: Date;
// }

export type AvailablePlanDTO = {
  id: string | undefined;
  name: string;
  description?: string;
  price: number;
  finalAmount: number;
  features: string[];
  maxProjects: number;
  maxMembersPerProject: number;
  isCurrent: boolean;
};

export interface IGetAvailablePlansUseCase {
  execute(userId: string): Promise<AvailablePlanDTO[]>;
}
