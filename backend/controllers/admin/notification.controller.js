const Notification = require("../../models/notification.model");

// [GET] /api/admin/notifications
module.exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ deleted: false })
      .sort({ createdAt: -1 })
      .limit(50); // Get latest 50 notifications
    
    const unreadCount = await Notification.countDocuments({ deleted: false, isRead: false });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error });
  }
};

// [PATCH] /api/admin/notifications/mark-read/:id
module.exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.updateOne({ _id: id }, { isRead: true });
    res.json({ message: "Đã đánh dấu đọc" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error });
  }
};

// [PATCH] /api/admin/notifications/mark-all-read
module.exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ message: "Đã đánh dấu tất cả là đã đọc" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error });
  }
};
