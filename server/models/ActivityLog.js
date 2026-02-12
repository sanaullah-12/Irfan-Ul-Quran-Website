const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  activityType: {
    type: String,
    enum: [
      "surah_view",
      "juz_view",
      "resource_access",
      "class_attended",
      "login",
      "progress_note",
    ],
    required: true,
  },
  activityDetails: {
    surahNumber: Number,
    surahName: String,
    juzNumber: Number,
    resourceName: String,
    classId: mongoose.Schema.Types.ObjectId,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
activityLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
