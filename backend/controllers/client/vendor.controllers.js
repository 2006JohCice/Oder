const Restaurant = require("../../models/restaurant.model");

module.exports.registerRestaurant = async (req, res) => {
  try {
    const { name, phone, address, description } = req.body;
    
    // Giả sử req.user đã được gán bởi middleware authentication
    // Nếu chưa có, ta lấy 1 mock user_id cho mục đích demo
    const owner_id = req.user ? req.user._id : "65a1234567890abcdef12345"; 

    if (!name || !phone || !address) {
      return res.status(400).json({ message: "Vui lòng cung cấp đủ tên, số điện thoại và địa chỉ" });
    }

    const newRestaurant = new Restaurant({
      name,
      phone,
      address,
      description,
      owner_id,
      status: "pending" // Admin cần duyệt
    });

    await newRestaurant.save();

    return res.status(201).json({
      message: "Đăng ký nhà hàng thành công, vui lòng chờ Admin phê duyệt.",
      restaurant: newRestaurant
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi đăng ký nhà hàng" });
  }
};
