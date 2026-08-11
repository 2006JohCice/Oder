const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: "system" }, // system, order, restaurant, chat
    isRead: { type: Boolean, default: false },
    link: { type: String, default: "" }, // URL to redirect when clicked
    icon: { type: String, default: "bi-info-circle" }, // Bootstrap icon class
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

const Notification = mongoose.model(
  "Notification",
  notificationSchema,
  "notifications"
);

module.exports = Notification;
