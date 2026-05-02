const Restaurant = require("../../models/restaurant.model");

module.exports.getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      status: "active",
      deleted: false,
    }).populate("owner_id", "fullname email");

    res.status(200).json({ restaurants });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};


module.exports.registerRestaurant = async (req, res) => {
 
  try {
    const { name, address, phone, tableCount } = req.body;
    const userId = String(res.locals.user?._id); // Lấy từ middleware auth

    console.log("Register restaurant data:", { name, address, phone, tableCount, userId });
    if (!name || !address || !phone || !tableCount) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });

    }

    if (!userId) {
      return res.status(401).json({ message: "Vui lòng đăng nhập để đăng ký nhà hàng" });
   

    }

    const restaurant = new Restaurant({
      name,
      address,
      phone,
      owner_id: userId,
      status: "pending", // Chờ phê duyệt
    });

    await restaurant.save();

    res.status(201).json({ message: "Đăng ký nhà hàng thành công, chờ phê duyệt từ admin" });
  } catch (error) {
    console.error("Error registering restaurant:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports.getRestaurantProducts = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const Product = require("../../models/product.model");

    const products = await Product.find({
      restaurant_id: restaurantId,
      status: "active",
      deleted: false,
    }).sort({ position: 1 });

    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching restaurant products:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};