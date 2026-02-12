import mongoose from "mongoose";

const courseEnrollmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  courseTitle: {
    type: String,
    required: true,
  },
  courseType: {
    type: String,
    enum: ["Nazra", "Tajweed", "Hifz", "Translation", "Tafseer"],
    required: true,
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["active", "completed", "paused"],
    default: "active",
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  description: {
    type: String,
  },
  lastAccessedDate: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.CourseEnrollment ||
  mongoose.model("CourseEnrollment", courseEnrollmentSchema);
