const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true, // Unique session ID to prevent multiple counts per session
    },
    isRegistered: {
      type: Boolean,
      default: false, // true if user is logged in
    },
    dateStr: {
      type: String,
      required: true, // Format: YYYY-MM-DD for easy grouping by day/month/year
    }
  },
  {
    timestamps: true, // createdAt will act as the visit time
  }
);

// Indexes to speed up stats queries
visitSchema.index({ dateStr: 1 });
visitSchema.index({ createdAt: 1 });

const Visit = mongoose.model("Visit", visitSchema, "visits");
module.exports = Visit;
