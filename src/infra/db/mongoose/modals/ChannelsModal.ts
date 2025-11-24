const channelSchema = new mongoose.Schema(
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
    channel_name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    created_by: {
      type: mongoose.Schema.Types.UUID,
      required: true,
      ref: "User",
    },
    is_private: {
      type: Boolean,
      default: false,
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

const Channel = mongoose.model("Channel", channelSchema);
