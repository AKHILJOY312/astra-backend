// src/infrastructure/persistence/mongoose/models/ProjectModel.ts
import mongoose, { Schema, Document } from "mongoose";
import {
  Project,
  ProjectProps,
} from "../../../../domain/entities/project/Project";

interface ProjectDoc extends Document {
  projectName: string;
  imageUrl?: string | null;
  description?: string;
  ownerId: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const projectSchema = new Schema<ProjectDoc>(
  {
    projectName: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: null },
    description: { type: String, default: "" },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);
projectSchema.index({ projectName: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ ownerId: 1, createdAt: -1 });

export const ProjectModel = mongoose.model<ProjectDoc>(
  "Project",
  projectSchema
);

// Mapper: DB → Domain Entity
export const toProjectEntity = (doc: ProjectDoc): Project => {
  const props: ProjectProps = {
    id: doc._id.toString(),
    projectName: doc.projectName,
    imageUrl: doc.imageUrl,
    description: doc.description,
    ownerId: doc.ownerId.toString(),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };

  const project = new Project(props);
  project.setId(doc._id.toString());
  if (doc.createdAt) project.setCreatedAt(doc.createdAt);
  if (doc.updatedAt) project.setUpdatedAt(doc.updatedAt);
  return project;
};
