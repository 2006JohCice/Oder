const Restaurant = require("../../models/restaurant.model");
const Product = require("../../models/product.model");

// Gợi ý nhà hàng: Ưu tiên rating cao, sau đó là lượng order nhiều
module.exports.getRecommendedRestaurants = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: { status: "active", deleted: false } },
      { 
        $addFields: {
          score: {
            $add: [
              { $multiply: [{ $ifNull: ["$ratingAverage", 0] }, 20] }, 
              { $multiply: [{ $ifNull: ["$orderCount", 0] }, 1] },     
              { $multiply: [{ $ifNull: ["$likesCount", 0] }, 5] }      
            ]
          }
        }
      },
      { $sort: { score: -1, _id: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    let restaurants = await Restaurant.aggregate(pipeline);

    // Thỉnh thoảng random cửa hàng rate thấp lên đề xuất (chỉ áp dụng ở trang 1)
    if (page === 1 && restaurants.length > 3) {
       const randomRest = await Restaurant.aggregate([
         { $match: { status: "active", deleted: false, ratingAverage: { $lt: 4.5 } } },
         { $sample: { size: 1 } }
       ]);
       if (randomRest.length > 0) {
         if (!restaurants.find(r => String(r._id) === String(randomRest[0]._id))) {
            // Thay thế một vị trí ngẫu nhiên bằng nhà hàng random này
            const randomIndex = Math.floor(Math.random() * restaurants.length);
            restaurants[randomIndex] = randomRest[0];
         }
       }
    }

    return res.status(200).json({
      message: "Danh sách nhà hàng đề xuất",
      recommendations: restaurants,
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
