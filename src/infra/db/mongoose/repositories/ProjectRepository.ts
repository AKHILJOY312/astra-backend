// src/infrastructure/persistence/mongoose/repositories/ProjectRepository.ts
import { IProjectRepository } from "../../../../application/repositories/IProjectRepository";
import { Project } from "../../../../domain/entities/project/Project";
import { ProjectModel, toProjectEntity } from "../modals/ProjectModal";

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
    const memberProjects = await ProjectModel.find({
      _id: {
        $in: (
          await ProjectModel.aggregate([
            {
              $lookup: {
                from: "projectmemberships",
                localField: "_id",
                foreignField: "projectId",
                as: "members",
              },
            },
            { $unwind: "$members" },
            { $match: { "members.userId": userId } },
            { $project: { _id: 1 } },
          ])
        ).map((r: any) => r._id),
      },
    });

    const all = [...owned, ...memberProjects];
    const unique = all.filter(
      (p, i, a) =>
        a.findIndex((t) => t._id.toString() === p._id.toString()) === i
    );
    return unique.map(toProjectEntity);
  }

  async countByOwnerId(ownerId: string): Promise<number> {
    return ProjectModel.countDocuments({ ownerId });
  }

  async existsByIdAndOwnerId(id: string, ownerId: string): Promise<boolean> {
    return !!(await ProjectModel.findOne({ _id: id, ownerId }));
  }
}
