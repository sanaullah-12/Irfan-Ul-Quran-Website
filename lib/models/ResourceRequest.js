import mongoose from "mongoose";

const resourceRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  requestMessage: {
    type: String,
    default: "",
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reviewedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

resourceRequestSchema.index({ userId: 1, status: 1 });

export default mongoose.models.ResourceRequest ||
  mongoose.model("ResourceRequest", resourceRequestSchema);
