const Restaurant = require("../../models/restaurant.model");
const Product = require("../../models/product.model");
const Table = require("../../models/table.model");

const findOwnerRestaurant = async (userId, onlyActive = true) => {
  const filter = { owner_id: userId, deleted: false };
  if (onlyActive) filter.status = "active";
  return Restaurant.findOne(filter);
};

module.exports.getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ status: "active", deleted: false }).populate("owner_id", "fullname email");
    return res.status(200).json({ restaurants });
  } catch (error) {
    return res.status(500).json({ message: "Loi server" });
  }
};

module.exports.registerRestaurant = async (req, res) => {
  try {
    const userId = String(res.locals.user?._id || "");
    const { name, address, phone, description, locationLabel, tables } = req.body || {};

    if (!userId) return res.status(401).json({ message: "Vui long dang nhap" });
    if (!name || !address || !phone) return res.status(400).json({ message: "Vui long nhap day du thong tin" });

    const existed = await Restaurant.findOne({ owner_id: userId, deleted: false });
    if (existed) return res.status(409).json({ message: "Tai khoan da dang ky nha hang" });

    const normalizedTables = Array.isArray(tables)
      ? tables
          .filter((t) => t && t.name)
          .map((t, idx) => ({
            tableNumber: String(t.name).trim(),
            area: String(t.area || locationLabel || "").trim(),
            capacity: Number(t.capacity || 4),
            note: String(t.note || "").trim(),
          }))
      : [];

    const restaurant = await Restaurant.create({
      name: String(name).trim(),
      address: String(address).trim(),
      phone: String(phone).trim(),
      description: String(description || "").trim(),
      locationLabel: String(locationLabel || "").trim(),
      tableCount: normalizedTables.length,
      owner_id: userId,
      status: "pending",
    });

    if (normalizedTables.length > 0) {
      await Table.insertMany(
        normalizedTables.map((t) => ({
          tableNumber: `${restaurant._id}-${t.tableNumber}`,
          displayName: t.tableNumber,
          area: t.area,
          capacity: t.capacity,
          note: t.note,
          restaurant_id: restaurant._id,
        }))
      );
    }

    return res.status(201).json({ message: "Dang ky nha hang thanh cong, cho duyet", restaurant });
  } catch (error) {
    return res.status(500).json({ message: "Loi server" });
  }
};

module.exports.getRestaurantProducts = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const products = await Product.find({ restaurant_id: restaurantId, status: "active", deleted: false }).sort({ position: 1 });
    return res.status(200).json({ products });
  } catch (error) {
    return res.status(500).json({ message: "Loi server" });
  }
};

module.exports.getMyRestaurant = async (req, res) => {
  try {
    const userId = res.locals.user._id;
    const restaurant = await Restaurant.findOne({ owner_id: userId, deleted: false });
    if (!restaurant) return res.status(404).json({ message: "Ban chua dang ky nha hang" });
    return res.status(200).json({ restaurant });
  } catch (error) {
    return res.status(500).json({ message: "Loi server" });
  }
};

module.exports.updateMyRestaurant = async (req, res) => {
  try {
    const userId = res.locals.user._id;
    const restaurant = await findOwnerRestaurant(userId, false);
    if (!restaurant) return res.status(404).json({ message: "Khong tim thay nha hang" });

    const { name, address, phone, description, locationLabel } = req.body || {};
    const update = {
      name: name ?? restaurant.name,
      address: address ?? restaurant.address,
      phone: phone ?? restaurant.phone,
      description: description ?? restaurant.description,
      locationLabel: locationLabel ?? restaurant.locationLabel,
    };

    await Restaurant.updateOne({ _id: restaurant._id }, update);
    const next = await Restaurant.findById(restaurant._id);
    return res.status(200).json({ message: "Cap nhat thanh cong", restaurant: next });
  } catch (error) {
    return res.status(500).json({ message: "Loi server" });
  }
};

module.exports.getMyProducts = async (req, res) => {
  try {
    const restaurant = await findOwnerRestaurant(res.locals.user._id, true);
    if (!restaurant) return res.status(403).json({ message: "Nha hang chua duoc phe duyet" });

    const products = await Product.find({ restaurant_id: restaurant._id, deleted: false }).sort({ position: 1 });
    return res.status(200).json({ products, restaurant });
  } catch (error) {
    return res.status(500).json({ message: "Loi server" });
  }
};

module.exports.createProduct = async (req, res) => {
  try {
    const restaurant = await findOwnerRestaurant(res.locals.user._id, true);
    if (!restaurant) return res.status(403).json({ message: "Nha hang chua duoc phe duyet" });

    const { name, price, description, img, category_id } = req.body || {};
    const product = await Product.create({ name, price, description, img, category_id, restaurant_id: restaurant._id, status: "active" });
    return res.status(201).json({ message: "Them san pham thanh cong", product });
  } catch (error) {
    return res.status(500).json({ message: "Loi server" });
  }
};

module.exports.updateProduct = async (req, res) => {
  try {
    const restaurant = await findOwnerRestaurant(res.locals.user._id, true);
    if (!restaurant) return res.status(403).json({ message: "Nha hang chua duoc phe duyet" });

    const { productId } = req.params;
    const product = await Product.findOne({ _id: productId, restaurant_id: restaurant._id, deleted: false });
    if (!product) return res.status(404).json({ message: "San pham khong ton tai" });

    await Product.updateOne({ _id: productId }, req.body || {});
    return res.status(200).json({ message: "Cap nhat san pham thanh cong" });
  } catch (error) {
    return res.status(500).json({ message: "Loi server" });
  }
};

module.exports.deleteProduct = async (req, res) => {
  try {
    const restaurant = await findOwnerRestaurant(res.locals.user._id, true);
    if (!restaurant) return res.status(403).json({ message: "Nha hang chua duoc phe duyet" });

    const { productId } = req.params;
    const product = await Product.findOne({ _id: productId, restaurant_id: restaurant._id, deleted: false });
    if (!product) return res.status(404).json({ message: "San pham khong ton tai" });

    await Product.updateOne({ _id: productId }, { deleted: true, deletedAt: new Date() });
    return res.status(200).json({ message: "Xoa san pham thanh cong" });
  } catch (error) {
    return res.status(500).json({ message: "Loi server" });
  }
};

module.exports.getMyTables = async (req, res) => {
  try {
    const restaurant = await findOwnerRestaurant(res.locals.user._id, true);
    if (!restaurant) return res.status(403).json({ message: "Nha hang chua duoc phe duyet" });

    const tables = await Table.find({ restaurant_id: restaurant._id }).sort({ createdAt: 1 });
    return res.status(200).json({ tables });
  } catch (error) {
    return res.status(500).json({ message: "Loi server" });
  }
};

module.exports.createTable = async (req, res) => {
  try {
    const restaurant = await findOwnerRestaurant(res.locals.user._id, true);
    if (!restaurant) return res.status(403).json({ message: "Nha hang chua duoc phe duyet" });

    const { name, area, capacity, note } = req.body || {};
    if (!name) return res.status(400).json({ message: "Ten ban la bat buoc" });

    const table = await Table.create({
      tableNumber: `${restaurant._id}-${String(name).trim()}`,
      displayName: String(name).trim(),
      area: String(area || "").trim(),
      capacity: Number(capacity || 4),
      note: String(note || "").trim(),
      restaurant_id: restaurant._id,
    });

    const count = await Table.countDocuments({ restaurant_id: restaurant._id });
    await Restaurant.updateOne({ _id: restaurant._id }, { tableCount: count });

    return res.status(201).json({ message: "Them ban thanh cong", table });
  } catch (error) {
    return res.status(500).json({ message: "Loi server" });
  }
};

module.exports.updateTable = async (req, res) => {
  try {
    const restaurant = await findOwnerRestaurant(res.locals.user._id, true);
    if (!restaurant) return res.status(403).json({ message: "Nha hang chua duoc phe duyet" });

    const { tableId } = req.params;
    const { name, area, capacity, note, status } = req.body || {};
    const table = await Table.findOne({ _id: tableId, restaurant_id: restaurant._id });
    if (!table) return res.status(404).json({ message: "Ban khong ton tai" });

    await Table.updateOne(
      { _id: tableId },
      {
        displayName: name ?? table.displayName,
        area: area ?? table.area,
        capacity: capacity ?? table.capacity,
        note: note ?? table.note,
        status: status ?? table.status,
      }
    );

    return res.status(200).json({ message: "Cap nhat ban thanh cong" });
  } catch (error) {
    return res.status(500).json({ message: "Loi server" });
  }
};

module.exports.deleteTable = async (req, res) => {
  try {
    const restaurant = await findOwnerRestaurant(res.locals.user._id, true);
    if (!restaurant) return res.status(403).json({ message: "Nha hang chua duoc phe duyet" });

    const { tableId } = req.params;
    await Table.deleteOne({ _id: tableId, restaurant_id: restaurant._id });

    const count = await Table.countDocuments({ restaurant_id: restaurant._id });
    await Restaurant.updateOne({ _id: restaurant._id }, { tableCount: count });

    return res.status(200).json({ message: "Xoa ban thanh cong" });
  } catch (error) {
    return res.status(500).json({ message: "Loi server" });
  }
};
