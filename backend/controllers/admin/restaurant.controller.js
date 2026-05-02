const Restaurant = require("../../models/restaurant.model");

module.exports.getRestaurants = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { deleted: false };

    if (status) {
      filter.status = status;
    }

    const restaurants = await Restaurant.find(filter)
      .populate("owner_id", "fullname email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({ restaurants });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports.updateRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive", "pending"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ message: "Nhà hàng không tồn tại" });
    }

    res.status(200).json({
      message: "Cập nhật trạng thái thành công",
      restaurant
    });
  } catch (error) {
    console.error("Error updating restaurant status:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};