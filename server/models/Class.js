const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  courseType: {
    type: String,
    default: "General",
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  scheduledTime: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    default: 60,
  },
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  maxStudents: {
    type: Number,
    default: 10,
  },
  enrolledStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  status: {
    type: String,
    enum: ["scheduled", "ongoing", "completed", "cancelled"],
    default: "scheduled",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Class", classSchema);
