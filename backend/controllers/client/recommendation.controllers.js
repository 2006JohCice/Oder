const Restaurant = require("../../models/restaurant.model");
const Product = require("../../models/product.model");

// Gợi ý nhà hàng: Ưu tiên rating cao, sau đó là lượng order nhiều
module.exports.getRecommendedRestaurants = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const restaurants = await Restaurant.find({ status: "active", deleted: false })
      .sort({ ratingAverage: -1, orderCount: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({
      message: "Danh sách nhà hàng đề xuất",
      restaurants
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi lấy danh sách nhà hàng đề xuất" });
  }
};

// Gợi ý món ăn: Món ăn bán chạy nhất (Trending)
module.exports.getTrendingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const products = await Product.find({ status: "active", deleted: false })
      .sort({ soldCount: -1 })
      .populate("restaurant_id", "name")
      .limit(limit)
      .lean();

    return res.status(200).json({
      message: "Danh sách món ăn thịnh hành",
      products
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi lấy danh sách món ăn đề xuất" });
  }
};
