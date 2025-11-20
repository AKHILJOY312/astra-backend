// infrastructure/repositories/PlanRepository.ts
import PlanModel from "../modals/PlanModal";
import { Plan } from "../../../../domain/entities/billing/Plan";
import { IPlanRepository } from "../../../../application/repositories/IPlanRepository";

export class PlanRepository implements IPlanRepository {
  // Convert Mongo Document → Domain Entity
  private toDomain(doc: any): Plan {
    return new Plan({
      id: doc.id,
      name: doc.name,
      description: doc.description,
      price: doc.price,
      finalAmount: doc.finalAmount,
      currency: doc.currency,
      billingCycle: doc.billingCycle,
      features: doc.features,
      maxProjects: doc.maxProjects,
      maxStorage: doc.maxStorage,
      isActive: doc.isActive,
      isDeleted: doc.isDeleted,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  // Convert Domain Entity → MongoDB format
  private toPersistence(plan: Plan) {
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      finalAmount: plan.finalAmount,
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      features: plan.features,
      maxProjects: plan.maxProjects,
      maxStorage: plan.maxStorage,
      isActive: plan.isActive,
      isDeleted: plan.isDeleted,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }

  // =================================
  //              CRUD
  // =================================

  async create(plan: Plan): Promise<Plan> {
    const data = this.toPersistence(plan);
    const doc = await PlanModel.create(data);
    return this.toDomain(doc);
  }

  async update(plan: Plan): Promise<void> {
    const data = this.toPersistence(plan);
    await PlanModel.updateOne({ id: data.id }, { $set: data });
  }

  async delete(id: string): Promise<Plan | null> {
    const doc = await PlanModel.findOneAndUpdate(
      { id },
      {
        $set: {
          isDeleted: true,
          isActive: false,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    return doc ? this.toDomain(doc) : null;
  }

  async findById(id: string): Promise<Plan | null> {
    const doc = await PlanModel.findOne({ id, isDeleted: false });
    return doc ? this.toDomain(doc) : null;
  }

  async findAllPaginated(page: number, limit: number): Promise<Plan[]> {
    const docs = await PlanModel.find({ isDeleted: false })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return docs.map((doc: any) => this.toDomain(doc));
  }

  async count(): Promise<number> {
    return PlanModel.countDocuments({ isDeleted: false });
  }
}
