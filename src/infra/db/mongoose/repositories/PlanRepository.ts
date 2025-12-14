// infrastructure/repositories/PlanRepository.ts
import { PlanModel } from "../models/PlanModal";
import { Plan } from "../../../../domain/entities/billing/Plan";
import { IPlanRepository } from "../../../../application/ports/repositories/IPlanRepository";

export class PlanRepository implements IPlanRepository {
  // Mapper: Mongo Doc → Domain Entity
  private toDomain(doc: any): Plan {
    const props = {
      id: doc.id,
      name: doc.name,
      description: doc.description,
      price: doc.price,
      finalAmount: doc.finalAmount,
      currency: doc.currency,
      billingCycle: doc.billingCycle,
      features: doc.features || [],
      maxProjects: doc.maxProjects,
      maxMembersPerProject: doc.maxMembersPerProject,
      isActive: doc.isActive,
      isDeleted: doc.isDeleted || false,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    const plan = new Plan(props);

    // if (doc._id) plan.setId(doc._id.toString());
    return plan;
  }

  // Mapper: Domain Entity → MongoDB save format
  private toPersistence(plan: Plan): any {
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
      maxMembersPerProject: plan.maxMembersPerProject,
      isActive: plan.isActive,
      isDeleted: plan.isDeleted,
    };
  }

  async create(plan: Plan): Promise<Plan> {
    const data = this.toPersistence(plan);
    const doc = await PlanModel.create(data);
    return this.toDomain(doc);
  }

  async update(plan: Plan): Promise<void> {
    const data = this.toPersistence(plan);

    await PlanModel.updateOne({ id: plan.id }, { $set: data });
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
    const doc = await PlanModel.findOne({ id: id });

    return doc ? this.toDomain(doc) : null;
  }

  async findAllPaginated(page: number, limit: number): Promise<Plan[]> {
    const docs = await PlanModel.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const result = docs.map((doc) => this.toDomain(doc));

    return result;
  }

  async count(): Promise<number> {
    return PlanModel.countDocuments({ isDeleted: false });
  }

  async findAllActive(): Promise<Plan[]> {
    const docs = await PlanModel.find({ isActive: true, isDeleted: false });
    return docs.map((doc) => this.toDomain(doc));
  }
  async findByName(name: string): Promise<Plan | null> {
    const doc = await PlanModel.findOne({
      name: { $regex: `^${name}$`, $options: "i" }, // case insensitive
      isDeleted: false,
    });

    return doc ? this.toDomain(doc) : null;
  }
}
