import { FilterQuery, HydratedDocument, Types } from "mongoose";
import { IProjectRepository } from "../../../../application/ports/repositories/IProjectRepository";
import { Project } from "../../../../domain/entities/project/Project";
import { ProjectMembershipModel } from "../models/ProjectMembershipModal";
import {
  ProjectModel,
  toProjectEntity,
  ProjectDoc,
} from "../models/ProjectModal";

type LeanMembership = { projectId: Types.ObjectId };

export class ProjectRepository implements IProjectRepository {
  async create(project: Project): Promise<Project> {
    const doc = new ProjectModel({
      projectName: project.projectName,
      imageUrl: project.imageUrl,
      description: project.description,
      ownerId: new Types.ObjectId(project.ownerId), // Ensure string to ObjectId conversion
    });
    const saved = await doc.save();
    return toProjectEntity(saved as HydratedDocument<ProjectDoc>);
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
    ).exec();
  }

  async delete(id: string): Promise<Project | null> {
    const doc = await ProjectModel.findByIdAndDelete(id).exec();
    return doc ? toProjectEntity(doc as HydratedDocument<ProjectDoc>) : null;
  }

  async findById(id: string): Promise<Project | null> {
    const doc = await ProjectModel.findById(id).exec();
    return doc ? toProjectEntity(doc as HydratedDocument<ProjectDoc>) : null;
  }

  async findByOwnerId(ownerId: string): Promise<Project[]> {
    const docs = await ProjectModel.find({
      ownerId: new Types.ObjectId(ownerId),
    }).exec();
    return docs.map((doc) =>
      toProjectEntity(doc as HydratedDocument<ProjectDoc>)
    );
  }

  async findAllByUserId(userId: string): Promise<Project[]> {
    const userObjectId = new Types.ObjectId(userId);

    // Get projects owned by user
    const owned = await ProjectModel.find({ ownerId: userObjectId }).exec();

    // Get project IDs where user is a member
    const membershipDocs = await ProjectMembershipModel.find(
      { userId: userObjectId },
      { projectId: 1, _id: 0 }
    )
      .lean<LeanMembership[]>()
      .exec();

    const projectIds = membershipDocs.map((doc) => doc.projectId);

    // Fetch member projects
    const memberProjects = await ProjectModel.find({
      _id: { $in: projectIds },
    }).exec();

    // Merge and filter unique by ID string
    const all = [...owned, ...memberProjects];
    const unique = all.filter(
      (p, i, a) =>
        a.findIndex((t) => t._id.toString() === p._id.toString()) === i
    );

    return unique.map((doc) =>
      toProjectEntity(doc as HydratedDocument<ProjectDoc>)
    );
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
    const userObjectId = new Types.ObjectId(userId);

    // Get member project IDs
    const memberships = await ProjectMembershipModel.find(
      { userId: userObjectId },
      { projectId: 1, _id: 0 }
    )
      .lean<LeanMembership[]>()
      .exec();

    const memberProjectIds = memberships.map((m) => m.projectId);

    // TYPED FILTER: Using FilterQuery<ProjectDoc> instead of any
    const filter: FilterQuery<ProjectDoc> = {
      $or: [{ ownerId: userObjectId }, { _id: { $in: memberProjectIds } }],
    };

    if (search) {
      filter.projectName = { $regex: search, $options: "i" };
    }

    const [docs, totalCount] = await Promise.all([
      ProjectModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      ProjectModel.countDocuments(filter).exec(),
    ]);

    return {
      projects: docs.map((doc) =>
        toProjectEntity(doc as HydratedDocument<ProjectDoc>)
      ),
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    };
  }

  async countByOwnerId(ownerId: string): Promise<number> {
    return ProjectModel.countDocuments({
      ownerId: new Types.ObjectId(ownerId),
    }).exec();
  }

  async existsByIdAndOwnerId(id: string, ownerId: string): Promise<boolean> {
    const count = await ProjectModel.countDocuments({
      _id: new Types.ObjectId(id),
      ownerId: new Types.ObjectId(ownerId),
    }).exec();
    return count > 0;
  }
  async existsByNameAndOwnerId(
    projectName: string,
    ownerId: string
  ): Promise<boolean> {
    const count = await ProjectModel.countDocuments({ projectName, ownerId });
    return count > 0;
  }
}
