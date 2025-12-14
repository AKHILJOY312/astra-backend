// src/infrastructure/persistence/mongoose/repositories/ProjectRepository.ts
import { IProjectRepository } from "../../../../application/ports/repositories/IProjectRepository";
import { Project } from "../../../../domain/entities/project/Project";
import { ProjectMembershipModel } from "../models/ProjectMembershipModal";
import { ProjectModel, toProjectEntity } from "../models/ProjectModal";

export class ProjectRepository implements IProjectRepository {
  async create(project: Project): Promise<Project> {
    const doc = new ProjectModel({
      projectName: project.projectName,
      imageUrl: project.imageUrl,
      description: project.description,
      ownerId: project.ownerId,
    });
    const saved = await doc.save();
    return toProjectEntity(saved);
  }

  async update(project: Project): Promise<void> {
    await ProjectModel.findByIdAndUpdate(
      project.id,
      {
        projectName: project.projectName,
        imageUrl: project.imageUrl,
        description: project.description,
      },
      { new: true }
    );
  }

  async delete(id: string): Promise<Project | null> {
    const doc = await ProjectModel.findByIdAndDelete(id);
    return doc ? toProjectEntity(doc) : null;
  }

  async findById(id: string): Promise<Project | null> {
    const doc = await ProjectModel.findById(id);
    return doc ? toProjectEntity(doc) : null;
  }

  async findByOwnerId(ownerId: string): Promise<Project[]> {
    const docs = await ProjectModel.find({ ownerId });
    return docs.map(toProjectEntity);
  }

  async findAllByUserId(userId: string): Promise<Project[]> {
    // Projects where user is owner OR member
    const owned = await ProjectModel.find({ ownerId: userId });
    // Step 1: Get all project IDs the user belongs to
    const membershipDocs = await ProjectMembershipModel.find(
      { userId: userId },
      { _id: 0, projectId: 1 } // only fetch projectId
    );

    const projectIds = membershipDocs.map((doc) => doc.projectId);

    // Step 2: Fetch projects
    const memberProjects = await ProjectModel.find({
      _id: { $in: projectIds },
    });

    const all = [...owned, ...memberProjects];
    const unique = all.filter(
      (p, i, a) =>
        a.findIndex((t) => t._id.toString() === p._id.toString()) === i
    );
    return unique.map(toProjectEntity);
  }
  async findPaginatedByUserId({
    userId,
    page,
    limit,
    search,
  }: {
    userId: string;
    page: number;
    limit: number;
    search?: string;
  }) {
    const skip = (page - 1) * limit;

    // Step 1: Get member project IDs
    const memberships = await ProjectMembershipModel.find(
      { userId },
      { projectId: 1, _id: 0 }
    );

    const memberProjectIds = memberships.map((m) => m.projectId);

    // Step 2: Build filter
    const filter: any = {
      $or: [{ ownerId: userId }, { _id: { $in: memberProjectIds } }],
    };

    if (search) {
      filter.projectName = { $regex: search, $options: "i" };
    }

    // Step 3: Count
    const totalCount = await ProjectModel.countDocuments(filter);

    // Step 4: Fetch paginated data
    const docs = await ProjectModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      projects: docs.map(toProjectEntity),
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    };
  }

  async countByOwnerId(ownerId: string): Promise<number> {
    return ProjectModel.countDocuments({ ownerId });
  }

  async existsByIdAndOwnerId(id: string, ownerId: string): Promise<boolean> {
    return !!(await ProjectModel.findOne({ _id: id, ownerId }));
  }
}
