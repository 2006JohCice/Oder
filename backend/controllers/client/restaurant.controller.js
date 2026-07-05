const Restaurant = require("../../models/restaurant.model");
const Product = require("../../models/product.model");
const Table = require("../../models/table.model");
const Order = require("../../models/orders.model");
const RestaurantFeedback = require("../../models/restaurant-feedback.model");
const RestaurantReport = require("../../models/restaurant-report.model");
const Voucher = require("../../models/voucher.model");

const findOwnerRestaurant = async (userId, onlyActive = true) => {
  const filter = { owner_id: userId, deleted: false };
  if (onlyActive) filter.status = "active";
  return Restaurant.findOne(filter);
};

module.exports.getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ status: "active", deleted: false })
      .populate("owner_id", "fullname email")
      .sort({ ratingAverage: -1, orderCount: -1, createdAt: -1 });
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
          .map((t) => ({
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
    const products = await Product.find({ restaurant_id: restaurantId, status: "active", deleted: false }).sort({
      soldCount: -1,
      position: 1,
    });
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

    const { name, address, phone, description, locationLabel, openTime, closeTime } = req.body || {};
    const update = {
      name: name ?? restaurant.name,
      address: address ?? restaurant.address,
      phone: phone ?? restaurant.phone,
      description: description ?? restaurant.description,
      locationLabel: locationLabel ?? restaurant.locationLabel,
      openTime: openTime ?? restaurant.openTime,
      closeTime: closeTime ?? restaurant.closeTime,
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

    const products = await Product.find({ restaurant_id: restaurant._id, deleted: false }).sort({
      soldCount: -1,
      position: 1,
    });
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
    const product = await Product.create({
      name,
      price,
      description,
      img,
      category_id,
      restaurant_id: restaurant._id,
      status: "active",
    });
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

    const { name, area, capacity, note, x, y, shape } = req.body || {};
    if (!name) return res.status(400).json({ message: "Ten ban la bat buoc" });

    const table = await Table.create({
      tableNumber: `${restaurant._id}-${String(name).trim()}`,
      displayName: String(name).trim(),
      area: String(area || "").trim(),
      capacity: Number(capacity || 4),
      note: String(note || "").trim(),
      x: Number(x || 0),
      y: Number(y || 0),
      shape: String(shape || "round").trim(),
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
    const { name, area, capacity, note, status, x, y, shape } = req.body || {};
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
        x: x ?? table.x,
        y: y ?? table.y,
        shape: shape ?? table.shape,
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

module.exports.syncTables = async (req, res) => {
  try {
    const restaurant = await findOwnerRestaurant(res.locals.user._id, true);
    if (!restaurant) return res.status(403).json({ message: "Nha hang chua duoc phe duyet" });

    const { tables } = req.body || {}; 
    if (!Array.isArray(tables)) return res.status(400).json({ message: "Danh sach ban khong hop le" });

    const existingTables = await Table.find({ restaurant_id: restaurant._id });
    const existingIds = existingTables.map(t => t._id.toString());
    
    const incomingIds = tables.filter(t => t._id && !t._id.startsWith("temp-")).map(t => t._id.toString());

    // 1. Delete tables not in payload
    const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));
    if (idsToDelete.length > 0) {
      await Table.deleteMany({ _id: { $in: idsToDelete }, restaurant_id: restaurant._id });
    }

    // 2. Update existing and Insert new
    for (const t of tables) {
      if (t._id && !t._id.startsWith("temp-")) {
        await Table.updateOne(
          { _id: t._id, restaurant_id: restaurant._id },
          {
            displayName: t.name || t.displayName,
            capacity: t.capacity,
            shape: t.shape,
            area: t.area || "",
            x: t.x,
            y: t.y,
          }
        );
      } else {
        await Table.create({
          tableNumber: `${restaurant._id}-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          displayName: t.name || t.displayName || "Bàn Mới",
          capacity: t.capacity || 4,
          shape: t.shape || "rect-small",
          area: t.area || "",
          x: t.x || 0,
          y: t.y || 0,
          restaurant_id: restaurant._id,
        });
      }
    }

    const count = await Table.countDocuments({ restaurant_id: restaurant._id });
    await Restaurant.updateOne({ _id: restaurant._id }, { tableCount: count });

    return res.status(200).json({ message: "Đồng bộ sơ đồ bàn thành công" });
  } catch (error) {
    console.error("syncTables error:", error);
    return res.status(500).json({ message: "Loi server" });
  }
};

module.exports.getMyOrders = async (req, res) => {
  try {
    const restaurant = await findOwnerRestaurant(res.locals.user._id, true);
    if (!restaurant) return res.status(403).json({ message: "Nha hang chua duoc phe duyet" });

    const orders = await Order.find({ restaurant_id: restaurant._id }).sort({ createdAt: -1 });
    return res.status(200).json({ orders, restaurant });
  } catch (error) {
    return res.status(500).json({ message: "Loi server" });
  }
};

module.exports.updateMyOrderStatus = async (req, res) => {
  try {
    const restaurant = await findOwnerRestaurant(res.locals.user._id, true);
    if (!restaurant) return res.status(403).json({ message: "Nha hang chua duoc phe duyet" });

    const { orderId } = req.params;
    const { status } = req.body || {};
    if (!["pending", "activating", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Trang thai khong hop le" });
    }

    const order = await Order.findOne({ _id: orderId, restaurant_id: restaurant._id });
    if (!order) return res.status(404).json({ message: "Khong tim thay don hang" });

    await Order.updateOne({ _id: orderId }, { orderStatus: status });

    if (order.orderType === "dine_in" && order.tableInfo?.tableNumber) {
      const tableNumbers = String(order.tableInfo.tableNumber).split(',').map(t => t.trim()).filter(Boolean);
        
      if (status === "completed" || status === "cancelled") {
        await Table.updateMany(
          { restaurant_id: restaurant._id, tableNumber: { $in: tableNumbers } },
          { $set: { status: "available" }, $unset: { currentOrderId: 1 } }
        );
      } else {
        await Table.updateMany(
          { restaurant_id: restaurant._id, tableNumber: { $in: tableNumbers } },
          { $set: { status: "occupied", currentOrderId: String(order._id) } }
        );
      }
    }

    return res.status(200).json({ message: "Cap nhat trang thai thanh cong" });
  } catch (error) {
    return res.status(500).json({ message: "Loi server" });
  }
};

module.exports.getMyDashboard = async (req, res) => {
  try {
    const restaurant = await findOwnerRestaurant(res.locals.user._id, true);
    if (!restaurant) return res.status(403).json({ message: "Nha hang chua duoc phe duyet" });

    const [allOrders, recentFeedbacks] = await Promise.all([
      Order.find({ restaurant_id: restaurant._id }).sort({ createdAt: -1 }),
      RestaurantFeedback.find({ restaurant_id: restaurant._id }).sort({ createdAt: -1 }).limit(6),
    ]);

    const totalProducts = await Product.countDocuments({ restaurant_id: restaurant._id, deleted: false });
    const totalRevenue = allOrders.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
    const pendingOrders = allOrders.filter((item) => item.orderStatus === "pending").length;
    const completedOrders = allOrders.filter((item) => item.orderStatus === "completed").length;
    const cancelledOrders = allOrders.filter((item) => item.orderStatus === "cancelled").length;

    // Calculate chart data (last 7 days activity)
    const chartLabels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
    const chartData = chartLabels.map(label => ({ name: label, delivery: 0, dine_in: 0 }));
    
    // Simple grouping by day of week
    allOrders.forEach(order => {
      const d = new Date(order.createdAt);
      let dayIndex = d.getDay() - 1; // 0 is Sunday, so Monday is 0
      if (dayIndex === -1) dayIndex = 6; // Sunday becomes 6
      if (dayIndex >= 0 && dayIndex <= 6) {
        if (order.orderType === "delivery") {
          chartData[dayIndex].delivery += 1;
        } else {
          chartData[dayIndex].dine_in += 1;
        }
      }
    });

    return res.status(200).json({
      stats: {
        totalProducts,
        totalOrders: allOrders.length,
        totalRevenue,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        ratingAverage: Number(restaurant.ratingAverage || 0),
        ratingCount: Number(restaurant.ratingCount || 0),
        orderCount: Number(restaurant.orderCount || 0),
      },
      chartData,
      recentOrders: allOrders.slice(0, 15),
      recentFeedbacks,
    });
  } catch (error) {
    return res.status(500).json({ message: "Loi server" });
  }
};

module.exports.getMyFeedbacks = async (req, res) => {
  try {
    const restaurant = await findOwnerRestaurant(res.locals.user._id, true);
    if (!restaurant) return res.status(403).json({ message: "Nha hang chua duoc phe duyet" });

    const feedbacks = await RestaurantFeedback.find({ restaurant_id: restaurant._id }).sort({ createdAt: -1 });
    return res.status(200).json({ feedbacks });
  } catch (error) {
    return res.status(500).json({ message: "Loi server" });
  }
};

module.exports.getMyReports = async (req, res) => {
  try {
    const restaurant = await findOwnerRestaurant(res.locals.user._id, true);
    if (!restaurant) return res.status(403).json({ message: "Nha hang chua duoc phe duyet" });

    const reports = await RestaurantReport.find({ restaurant_id: restaurant._id }).sort({ createdAt: -1 });
    return res.status(200).json({ reports });
  } catch (error) {
    return res.status(500).json({ message: "Loi server" });
  }
};

const paginate = (items, page = 1, limit = 10) => {
  const currentPage = Number(page || 1);
  const pageSize = Number(limit || 10);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return {
    items: items.slice(start, end),
    pagination: {
      page: currentPage,
      limit: pageSize,
      totalItems,
      totalPages,
    },
  };
};

module.exports.getOrderList = async (req, res) => {
  try {
    const restaurant = await findOwnerRestaurant(res.locals.user._id, true);
    if (!restaurant) return res.status(403).json({ message: "Nha hang chua duoc phe duyet" });

    const { q = "", status = "", type = "", page = 1, limit = 10 } = req.query;
    const allOrders = await Order.find({ restaurant_id: restaurant._id }).sort({ createdAt: -1 }).lean();

    const keyword = String(q || "").trim().toLowerCase();
    const filtered = allOrders.filter((order) => {
      const matchesStatus = status ? order.orderStatus === status : true;
      const matchesType = type ? order.orderType === type : true;
      const haystack = [
        order.orderId,
        order.orderGroupCode,
        order.userInfo?.fullName,
        order.userInfo?.phone,
        order.restaurantInfo?.name,
      ].filter(Boolean).join(" ").toLowerCase();
      
      const matchesKeyword = keyword ? haystack.includes(keyword) : true;
      return matchesStatus && matchesType && matchesKeyword;
    });

    const totalRevenue = filtered.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
    const stats = {
      totalOrders: filtered.length,
      pendingOrders: filtered.filter((item) => item.orderStatus === "pending").length,
      dineInOrders: filtered.filter((item) => item.orderType === "dine_in").length,
      deliveryOrders: filtered.filter((item) => item.orderType === "delivery").length,
      totalRevenue,
      totalDeposits: filtered.reduce((sum, item) => sum + Number(item.depositAmount || 0), 0),
    };

    const paged = paginate(filtered, page, limit);
    res.json({
      orders: paged.items,
      pagination: paged.pagination,
      stats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Loi khi lay du lieu" });
  }
};

module.exports.getRestaurantVouchers = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const now = new Date();

    const vouchers = await Voucher.find({
      restaurant_id: restaurantId,
      status: 'active',
      deleted: false,
      expirationDate: { $gte: now }
    }).sort({ createdAt: -1 });

    res.json({ vouchers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
