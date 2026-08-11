const Visit = require("../../models/visit.model");
const SeoPost = require("../../models/seo-post.model");

// [POST] /api/visit/record
module.exports.recordVisit = async (req, res) => {
  try {
    const { sessionId, isRegistered } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: "Thiếu sessionId" });
    }

    const date = new Date();
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    // Try to insert the visit. If it already exists for this sessionId, it will fail (unique index)
    try {
      await Visit.create({
        sessionId,
        isRegistered: Boolean(isRegistered),
        dateStr
      });
    } catch (e) {
      // Ignore duplicate key error (meaning user already visited today)
      if (e.code !== 11000) {
        console.error("Visit tracking error:", e);
      }
    }

    res.status(200).json({ message: "Recorded" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// [GET] /api/visit/stats
module.exports.getStats = async (req, res) => {
  try {
    const { year, month } = req.query; // optional filters
    
    let matchStage = {};
    if (year && month) {
      const datePrefix = `${year}-${String(month).padStart(2, '0')}`;
      matchStage.dateStr = { $regex: `^${datePrefix}` };
    } else if (year) {
      matchStage.dateStr = { $regex: `^${year}` };
    } else {
      // Default to current year
      const currentYear = new Date().getFullYear();
      matchStage.dateStr = { $regex: `^${currentYear}` };
    }

    const stats = await Visit.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            month: { $substr: ["$dateStr", 5, 2] },
            isRegistered: "$isRegistered"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.month": 1 }
      }
    ]);

    // Format output
    const formattedStats = [];
    for (let i = 1; i <= 12; i++) {
      const monthStr = String(i).padStart(2, '0');
      const registeredCount = stats.find(s => s._id.month === monthStr && s._id.isRegistered)?.count || 0;
      const unregisteredCount = stats.find(s => s._id.month === monthStr && !s._id.isRegistered)?.count || 0;
      
      formattedStats.push({
        month: `Tháng ${i}`,
        registered: registeredCount,
        unregistered: unregisteredCount,
        total: registeredCount + unregisteredCount
      });
    }

    res.status(200).json({ stats: formattedStats });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// [GET] /api/visit/blogs
module.exports.getPublicBlogs = async (req, res) => {
  try {
    const blogs = await SeoPost.find({ status: "published" }).sort({ createdAt: -1 });
    res.status(200).json({ blogs });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// [GET] /api/visit/blogs/:slug
module.exports.getPublicBlogDetail = async (req, res) => {
  try {
    const blog = await SeoPost.findOneAndUpdate(
      { slug: req.params.slug, status: "published" },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!blog) return res.status(404).json({ message: "Không tìm thấy bài viết" });
    res.status(200).json({ blog });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
};
