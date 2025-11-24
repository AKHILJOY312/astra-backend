// src/infrastructure/persistence/mongoose/models/ProjectMembershipModel.ts
import mongoose, { Schema, Document } from "mongoose";
import {
  ProjectMembership,
  ProjectMembershipProps,
  ProjectRole,
} from "../../../../domain/entities/project/ProjectMembership";

interface MembershipDoc extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: ProjectRole;
  joinedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const membershipSchema = new Schema<MembershipDoc>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["manager", "lead", "member"],
      default: "member",
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

membershipSchema.index({ projectId: 1, userId: 1 }, { unique: true });
membershipSchema.index({ userId: 1 });

export const ProjectMembershipModel = mongoose.model<MembershipDoc>(
  "ProjectMembership",
  membershipSchema
);

// Mapper: DB → Domain Entity
export const toProjectMembershipEntity = (
  doc: MembershipDoc
): ProjectMembership => {
  const props: ProjectMembershipProps = {
    id: doc._id.toString(),
    projectId: doc.projectId.toString(),
    userId: doc.userId.toString(),
    role: doc.role,
    joinedAt: doc.joinedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };

  const membership = new ProjectMembership(props);
  membership.setId(doc._id.toString());
  return membership;
};
