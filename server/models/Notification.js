const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: [
      "class_scheduled",
      "class_cancelled",
      "class_reminder",
      "class_completed",
      "teacher_assigned",
      "resource_approved",
      "resource_rejected",
      "general",
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  metadata: {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "ClassSchedule" },
    courseType: String,
    scheduledDate: Date,
    teacherName: String,
    roomId: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
