import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.UUID,
      default: () => uuidv4(),
    },
    project_name: {
      type: String,
      required: true,
    },
    image_url: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: "",
    },
    owner_id: {
      type: mongoose.Schema.Types.UUID,
      required: true,
      ref: "User", // assuming a 'User' collection exists
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Project = mongoose.model("Project", projectSchema);
