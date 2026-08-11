const Notification = require("../models/notification.model");

/**
 * Creates a notification in DB and emits it via socket.io
 * @param {Object} app - Express app instance (to get io)
 * @param {Object} data - Notification data { title, message, type, link, icon }
 */
const emitNotification = async (app, data) => {
  try {
    const notification = new Notification(data);
    await notification.save();

    const io = app.get("io");
    if (io) {
      io.emit("new_notification", notification);
    }
  } catch (error) {
    console.error("Lỗi khi tạo và gửi thông báo:", error);
  }
};

module.exports = {
  emitNotification
};
