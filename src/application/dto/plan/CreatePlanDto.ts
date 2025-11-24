export interface CreatePlanDto {
  name: string;
  description: string;
  price: number;
  finalAmount: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  features: string[];
  maxProjects: number;
  maxMembersPerProject: number;
  maxStorage: number;
}
