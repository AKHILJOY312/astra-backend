const projectMembershipSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.UUID,
      default: () => uuidv4(),
    },
    project_id: {
      type: mongoose.Schema.Types.UUID,
      required: true,
      ref: "Project",
    },
    user_id: {
      type: mongoose.Schema.Types.UUID,
      required: true,
      ref: "User",
    },
    role: {
      type: String,
      enum: ["member", "manager"],
      default: "member",
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
    joined_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const ProjectMembership = mongoose.model(
  "ProjectMembership",
  projectMembershipSchema
);
