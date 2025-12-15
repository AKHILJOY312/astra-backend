// src/infrastructure/persistence/mongoose/repositories/ProjectMembershipRepository.ts
import { ProjectMemberView } from "@/application/dto/project/ProjectMemberView";
import { IProjectMembershipRepository } from "../../../../application/ports/repositories/IProjectMembershipRepository";
import { ProjectMembership } from "../../../../domain/entities/project/ProjectMembership";
import {
  ProjectMembershipModel,
  toProjectMembershipEntity,
} from "../models/ProjectMembershipModal";
import mongoose from "mongoose";

export class ProjectMembershipRepository
  implements IProjectMembershipRepository
{
  async create(membership: ProjectMembership): Promise<ProjectMembership> {
    const doc = new ProjectMembershipModel({
      projectId: membership.projectId,
      userId: membership.userId,
      role: membership.role,
      joinedAt: membership.joinedAt,
    });
    const saved = await doc.save();
    return toProjectMembershipEntity(saved);
  }

  async update(membership: ProjectMembership): Promise<void> {
    await ProjectMembershipModel.findByIdAndUpdate(membership.id, {
      role: membership.role,
    });
  }

  async delete(id: string): Promise<ProjectMembership | null> {
    const doc = await ProjectMembershipModel.findByIdAndDelete(id);
    return doc ? toProjectMembershipEntity(doc) : null;
  }

  async deleteByProjectAndUser(
    projectId: string,
    userId: string
  ): Promise<void> {
    await ProjectMembershipModel.deleteOne({ projectId, userId });
  }

  async findById(id: string): Promise<ProjectMembership | null> {
    const doc = await ProjectMembershipModel.findById(id);
    return doc ? toProjectMembershipEntity(doc) : null;
  }

  async findByProjectAndUser(
    projectId: string,
    userId: string
  ): Promise<ProjectMembership | null> {
    const doc = await ProjectMembershipModel.findOne({ projectId, userId });

    return doc ? toProjectMembershipEntity(doc) : null;
  }

  async findByProjectId(projectId: string): Promise<ProjectMembership[]> {
    const docs = await ProjectMembershipModel.find({ projectId });
    return docs.map(toProjectMembershipEntity);
  }

  async findByUserId(userId: string): Promise<ProjectMembership[]> {
    const docs = await ProjectMembershipModel.find({ userId });
    return docs.map(toProjectMembershipEntity);
  }

  async countMembersInProject(projectId: string): Promise<number> {
    return ProjectMembershipModel.countDocuments({ projectId });
  }

  async countManagersInProject(projectId: string): Promise<number> {
    return ProjectMembershipModel.countDocuments({
      projectId,
      role: "manager",
    });
  }

  async existsManagerInProject(
    projectId: string,
    userId: string
  ): Promise<boolean> {
    return !!(await ProjectMembershipModel.findOne({
      projectId,
      userId,
      role: "manager",
    }));
  }

  async findMembersWithUserDetails(
    projectId: string
  ): Promise<ProjectMemberView[]> {
    const results = await ProjectMembershipModel.aggregate([
      {
        $match: {
          projectId: new mongoose.Types.ObjectId(projectId),
        },
      },
      {
        $lookup: {
          from: "users", // MongoDB collection name
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          role: 1,
          joinedAt: 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
        },
      },
    ]);

    return results.map((m) => ({
      id: m._id.toString(),
      role: m.role,
      joinedAt: m.joinedAt,
      user: {
        id: m.user._id.toString(),
        name: m.user.name,
        email: m.user.email,
      },
    }));
  }
}
