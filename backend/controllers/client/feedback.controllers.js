const RestaurantFeedback = require("../../models/restaurant-feedback.model");
const Restaurant = require("../../models/restaurant.model");

// Gửi đánh giá cho nhà hàng
module.exports.submitFeedback = async (req, res) => {
  try {
    const restaurant_id = req.params.id;
    const { rating, feedback, fullname, email } = req.body;
    const user_id = req.user ? req.user._id : null; // Lấy từ middleware authen nếu có

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Vui lòng chọn đánh giá từ 1 đến 5 sao" });
    }

    // Kiểm tra nhà hàng tồn tại
    const restaurant = await Restaurant.findById(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({ message: "Nhà hàng không tồn tại" });
    }

    // Tạo đánh giá mới
    const newFeedback = new RestaurantFeedback({
      user_id,
      restaurant_id,
      fullname,
      email,
      restaurant: restaurant.name,
      rating,
      feedback,
      sentiment: rating >= 4 ? "good" : (rating === 3 ? "neutral" : "bad")
    });

    await newFeedback.save();

    // Tính toán lại rating trung bình cho nhà hàng
    const currentRatingCount = restaurant.ratingCount || 0;
    const currentRatingAverage = restaurant.ratingAverage || 0;

    const newRatingCount = currentRatingCount + 1;
    const newRatingAverage = ((currentRatingAverage * currentRatingCount) + parseInt(rating)) / newRatingCount;

    await Restaurant.updateOne(
      { _id: restaurant_id },
      {
        ratingCount: newRatingCount,
        ratingAverage: Number(newRatingAverage.toFixed(1))
      }
    );

    return res.status(201).json({
      message: "Cảm ơn bạn đã đánh giá nhà hàng!",
      feedback: newFeedback
    });

  } catch (error) {
    console.error("Lỗi khi gửi đánh giá:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy danh sách đánh giá của một nhà hàng
module.exports.getFeedbacks = async (req, res) => {
  try {
    const restaurant_id = req.params.id;
    
    const feedbacks = await RestaurantFeedback.find({ restaurant_id })
      .sort({ createdAt: -1 })
      .lean();

    const restaurant = await Restaurant.findById(restaurant_id).select("ratingAverage ratingCount name");

    return res.status(200).json({ 
      feedbacks,
      ratingAverage: restaurant ? restaurant.ratingAverage : 5,
      ratingCount: restaurant ? restaurant.ratingCount : feedbacks.length,
      restaurantName: restaurant ? restaurant.name : "Nhà hàng"
    });
  } catch (error) {
    console.error("Lỗi khi lấy đánh giá:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
