const ChatMessage = require("../../models/chat-message.model");

// [GET] /api/admin/chat/:room
module.exports.getMessages = async (req, res) => {
  try {
    const { room } = req.params;
    const messages = await ChatMessage.find({ room, deleted: false }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error });
  }
};

// [GET] /api/admin/chat
module.exports.getRooms = async (req, res) => {
  try {
    const rooms = await ChatMessage.aggregate([
      { $match: { deleted: false } },
      { $sort: { createdAt: -1 } },
      { $group: {
          _id: "$room",
          lastMessage: { $first: "$text" },
          lastTime: { $first: "$time" },
          senderName: { $first: "$senderName" },
          updatedAt: { $first: "$createdAt" },
          customerNames: {
            $addToSet: {
              $cond: [{ $ne: ["$sender", "admin"] }, "$senderName", null]
            }
          }
      }},
      { $addFields: {
          customerName: {
            $arrayElemAt: [
              { $filter: { input: "$customerNames", as: "name", cond: { $ne: ["$$name", null] } } },
              0
            ]
          }
      }},
      { $project: { customerNames: 0 } },
      { $sort: { updatedAt: -1 } }
    ]);
    res.json({ rooms });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error });
  }
};
