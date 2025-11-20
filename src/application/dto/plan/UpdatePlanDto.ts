// application/dtos/UpdatePlanDto.ts
export interface UpdatePlanDto {
  id: string; // required to update
  name?: string;
  description?: string;
  price?: number;
  finalAmount?: number;
  currency?: string;
  billingCycle?: "monthly" | "yearly";
  features?: string[];
  maxProjects?: number;
  maxStorage?: number;
  isActive?: boolean; // optional toggle
}
