const Restaurant = require("../../models/restaurant.model");
const User = require("../../models/user.model");

module.exports.getRestaurants = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { deleted: { $ne: true } };
    if (status) filter.status = status;

    const restaurants = await Restaurant.find(filter)
      .populate("owner_id", "fullname email phone role")
      .sort({ ratingAverage: -1, orderCount: -1, createdAt: -1 });

    return res.status(200).json({ restaurants });
  } catch (error) {
    return res.status(500).json({ message: "Loi server" });
  }
};

module.exports.updateRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!["active", "inactive", "pending"].includes(status)) {
      return res.status(400).json({ message: "Trang thai khong hop le" });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(id, { status }, { new: true });
    if (!restaurant) return res.status(404).json({ message: "Nha hang khong ton tai" });

    if (status === "active") {
      await User.updateOne(
        { _id: restaurant.owner_id },
        { role: "owner", restaurant_id: restaurant._id }
      );
    }

    if (status === "inactive") {
      await User.updateOne(
        { _id: restaurant.owner_id },
        { role: "user", restaurant_id: null }
      );
    }

    return res.status(200).json({ message: "Cap nhat trang thai thanh cong", restaurant });
  } catch (error) {
    return res.status(500).json({ message: "Loi server" });
  }
};

module.exports.deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findByIdAndUpdate(id, { deleted: true, deletedAt: new Date() }, { new: true });
    if (!restaurant) return res.status(404).json({ message: "Nha hang khong ton tai" });

    // Remove ownership from user
    await User.updateOne(
      { _id: restaurant.owner_id },
      { role: "user", restaurant_id: null }
    );

    return res.status(200).json({ message: "Xoa nha hang thanh cong" });
  } catch (error) {
    return res.status(500).json({ message: "Loi server" });
  }
};
