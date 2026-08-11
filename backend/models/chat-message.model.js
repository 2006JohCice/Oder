const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    room: { type: String, default: "support" }, // Can be user_id or specific room
    sender: { type: String, required: true }, // 'admin' or 'customer'
    senderName: { type: String, default: "" }, 
    text: { type: String, required: true },
    time: { type: String }, // Pre-formatted time like '09:30'
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ChatMessage = mongoose.model(
  "ChatMessage",
  chatMessageSchema,
  "chat-messages"
);

module.exports = ChatMessage;
