const aiData = require("../../utils/aiData.json");
const fs = require("fs");
const path = require("path");
const Fuse = require("fuse.js");
const { emitNotification } = require("../../helpers/notification");

// Hàm chuẩn hóa chuỗi: xóa dấu, đưa về chữ thường
const normalizeString = (str) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/gi, "")
    .trim();
};

// Chuẩn bị dữ liệu cho Fuse (thêm trường normalizedKeywords để tìm kiếm mờ tốt hơn)
const processedAiData = aiData.map(item => ({
  ...item,
  normalizedKeywords: item.keywords.map(k => normalizeString(k))
}));

module.exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Vui lòng nhập tin nhắn" });
    }

    const normalizedMessage = normalizeString(message);

    // Cấu hình Fuse.js
    const options = {
      includeScore: true,
      keys: ['keywords', 'normalizedKeywords'],
      threshold: 0.4, // Ngưỡng độ lệch chuẩn (0 là giống hoàn toàn, 1 là khác hoàn toàn)
      ignoreLocation: true
    };

    const fuse = new Fuse(processedAiData, options);

    // Tìm kiếm
    let result = fuse.search(message);
    if (result.length === 0 && normalizedMessage !== message) {
      // Thử tìm kiếm với chuỗi đã loại bỏ dấu nếu chuỗi gốc không có kết quả
      result = fuse.search(normalizedMessage);
    }

    if (result.length > 0) {
      const bestMatch = result[0].item;
      
      if (bestMatch.notifyAdmin) {
        emitNotification(req.app, {
          title: "Yêu cầu hỗ trợ từ AI",
          message: `Khách hàng vừa gửi yêu cầu: "${message}"`,
          type: "ai_support",
          link: "/admin/chat",
          icon: "fa-headset"
        });
      }

      return res.json({ 
        success: true, 
        answer: bestMatch.answer 
      });
    }

    // Fallback nếu không hiểu
    const unmatchedPath = path.join(__dirname, "../../utils/aiUnmatched.json");
    let unmatchedData = [];
    try {
      if (fs.existsSync(unmatchedPath)) {
        unmatchedData = JSON.parse(fs.readFileSync(unmatchedPath, "utf8"));
      }
      // Tránh lưu trùng lặp quá nhiều
      if (!unmatchedData.some(item => item.query.toLowerCase() === message.toLowerCase())) {
        unmatchedData.push({
          query: message,
          time: new Date().toISOString()
        });
        fs.writeFileSync(unmatchedPath, JSON.stringify(unmatchedData, null, 2));

        emitNotification(req.app, {
          title: "AI không hiểu câu hỏi",
          message: `Câu hỏi: "${message}"`,
          type: "ai_unmatched",
          link: "/admin/ai-unmatched", 
          icon: "fa-question-circle"
        });
      }
    } catch (err) {
      console.error("Lỗi lưu câu hỏi chưa xác định:", err);
    }

    return res.json({ 
      success: true, 
      answer: "Câu hỏi của bạn tôi không xác định được sản phẩm hay món ăn." 
    });

  } catch (error) {
    console.error("Lỗi AI Controller:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};
