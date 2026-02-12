const mongoose = require("mongoose");

const classScheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  courseType: {
    type: String,
    enum: ["Nazra", "Tajweed", "Hifz", "Translation", "Tafseer"],
    required: true,
  },
  teacherName: {
    type: String,
    default: "Attiq Ur Rehman",
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    default: 60,
  },
  status: {
    type: String,
    enum: ["scheduled", "completed", "missed", "cancelled"],
    default: "scheduled",
  },
  roomId: {
    type: String,
  },
  recordingUrl: {
    type: String,
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
classScheduleSchema.index({ userId: 1, scheduledDate: -1 });
classScheduleSchema.index({ teacherId: 1, scheduledDate: -1 });

module.exports = mongoose.model("ClassSchedule", classScheduleSchema);
