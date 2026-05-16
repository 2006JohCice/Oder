const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Order = require("../../models/orders.model");
const Table = require("../../models/table.model");
const Restaurant = require("../../models/restaurant.model");
const generateHelper = require("../../helpers/generate");

const DEPOSIT_AMOUNT = 200000;

const buildSlotKey = (visitDate, arrivalTime) => {
  if (!visitDate || !arrivalTime) return "";
  return `${visitDate}_${arrivalTime}`;
};

const mapProductsByRestaurant = async (cartProducts = []) => {
  const groups = new Map();

  for (const cartItem of cartProducts) {
    const productInfo = await Product.findOne({ _id: cartItem.product_id, deleted: false })
      .populate("restaurant_id", "name phone address")
      .lean();

    if (!productInfo) continue;

    const restaurant = productInfo.restaurant_id;
    const restaurantId = restaurant?._id ? String(restaurant._id) : "";
    if (!restaurantId) continue;

    if (!groups.has(restaurantId)) {
      groups.set(restaurantId, {
        restaurantId,
        restaurantInfo: {
          name: restaurant.name || "",
          phone: restaurant.phone || "",
          address: restaurant.address || "",
        },
        products: [],
      });
    }

    groups.get(restaurantId).products.push({
      product_id: String(cartItem.product_id),
      restaurant_id: restaurantId,
      name: productInfo.name || "",
      img: productInfo.img || "",
      price: Number(productInfo.price || 0),
      discountPercentage: Number(productInfo.discountPercentage || 0),
      quantity: Number(cartItem.quantity || 0),
    });
  }

  return Array.from(groups.values());
};

const ensureGroupRequest = (groupRequests = [], restaurantId) => {
  return groupRequests.find((item) => String(item.restaurantId || "") === String(restaurantId)) || null;
};

const validateOrderGroup = (group, requestGroup, fallbackUserInfo) => {
  const orderType = requestGroup?.orderType === "delivery" ? "delivery" : "dine_in";
  const userInfo = {
    fullName: String(requestGroup?.fullName || fallbackUserInfo.fullName || "").trim(),
    phone: String(requestGroup?.phone || fallbackUserInfo.phone || "").trim(),
    address: String(requestGroup?.address || fallbackUserInfo.address || "").trim(),
  };

  if (!userInfo.fullName || !userInfo.phone) {
    return { error: "Vui long nhap ho ten va so dien thoai cho tung nha hang" };
  }

  if (orderType === "delivery" && !userInfo.address) {
    return { error: `Vui long nhap dia chi giao hang cho ${group.restaurantInfo.name}` };
  }

  const tableInfoInput = requestGroup?.tableInfo || {};
  const tableInfo =
    orderType === "dine_in"
      ? {
          area: String(tableInfoInput.area || "").trim(),
          tableNumber: String(tableInfoInput.tableNumber || "").trim(),
          guestCount: Number(tableInfoInput.guestCount || 1),
          visitDate: String(tableInfoInput.visitDate || "").trim(),
          arrivalTime: String(tableInfoInput.arrivalTime || "").trim(),
          note: String(tableInfoInput.note || "").trim(),
        }
      : null;

  if (orderType === "dine_in") {
    if (!tableInfo.tableNumber || !tableInfo.visitDate || !tableInfo.arrivalTime) {
      return { error: `Vui long chon ban, ngay va gio den cho ${group.restaurantInfo.name}` };
    }
  }

  const relativeContact = requestGroup?.relativeContact
    ? {
        fullName: String(requestGroup.relativeContact.fullName || "").trim(),
        phone: String(requestGroup.relativeContact.phone || "").trim(),
        relationship: String(requestGroup.relativeContact.relationship || "").trim(),
      }
    : null;

  return {
    orderType,
    userInfo,
    tableInfo,
    relativeContact,
  };
};

const lockTableForSlot = async (restaurantId, tableInfo, orderId, relativeContact) => {
  const slotKey = buildSlotKey(tableInfo.visitDate, tableInfo.arrivalTime);

  const selectedTable = await Table.findOne({
    restaurant_id: restaurantId,
    tableNumber: tableInfo.tableNumber,
  });

  if (!selectedTable) {
    return { error: "Ban khong ton tai trong nha hang da chon" };
  }

  const conflictingOrders = await Order.find({
    restaurant_id: restaurantId,
    orderType: "dine_in",
    bookingSlotKey: slotKey,
    orderStatus: { $nin: ["completed", "cancelled"] },
  }).select("tableInfo relativeContact");

  const exactSameTable = conflictingOrders.find(
    (order) => String(order.tableInfo?.tableNumber || "") === String(tableInfo.tableNumber || "")
  );

  if (exactSameTable) {
    return { error: "Ban nay da duoc dat trong cung khung gio, vui long chon ban khac" };
  }

  if (conflictingOrders.length > 0 && (!relativeContact?.fullName || !relativeContact?.phone)) {
    return {
      error: "Khung gio nay da co nguoi dat truoc. Neu dat them ban thu hai, vui long nhap thong tin nguoi than.",
    };
  }

  await Table.updateOne(
    { _id: selectedTable._id },
    {
      status: "occupied",
      currentOrderId: String(orderId),
    }
  );

  return {
    table: selectedTable,
    slotKey,
  };
};

const releaseLockedTables = async (lockedTables = []) => {
  for (const lock of lockedTables) {
    await Table.updateOne(
      {
        _id: lock.tableId,
        currentOrderId: String(lock.orderId),
      },
      {
        status: "available",
        currentOrderId: "",
      }
    );
  }
};

const calculateTotal = (products = []) =>
  products.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

const updateRestaurantStats = async (restaurantId, orderTotal) => {
  await Restaurant.updateOne(
    { _id: restaurantId },
    {
      $inc: {
        orderCount: 1,
        totalRevenue: Number(orderTotal || 0),
      },
    }
  );
};

const updateProductSoldCount = async (products = []) => {
  for (const item of products) {
    await Product.updateOne(
      { _id: item.product_id },
      { $inc: { soldCount: Number(item.quantity || 0) } }
    );
  }
};

module.exports.index = async (req, res) => {
  return res.status(200).json({ message: "Checkout ready", depositAmount: DEPOSIT_AMOUNT });
};

module.exports.order = async (req, res) => {
  const lockedTables = [];

  try {
    const cartId = req.cookies.cartId;
    const cart = await Cart.findOne({ _id: cartId });

    if (!cart || !Array.isArray(cart.products) || cart.products.length === 0) {
      return res.status(400).json({ message: "Gio hang khong hop le hoac rong" });
    }

    const fallbackUserInfo = {
      fullName: req.body?.fullName || "",
      phone: req.body?.phone || "",
      address: req.body?.address || "",
    };

    const groupRequests = Array.isArray(req.body?.restaurantOrders) ? req.body.restaurantOrders : [];
    const groupedProducts = await mapProductsByRestaurant(cart.products);

    if (groupedProducts.length === 0) {
      return res.status(400).json({ message: "Khong co san pham hop le trong gio hang" });
    }

    const orderGroupCode = generateHelper.generateRandomOrderId(8);
    const createdOrders = [];

    for (const group of groupedProducts) {
      const requestGroup = ensureGroupRequest(groupRequests, group.restaurantId) || {
        restaurantId: group.restaurantId,
        fullName: fallbackUserInfo.fullName,
        phone: fallbackUserInfo.phone,
        address: fallbackUserInfo.address,
        orderType: req.body?.orderType || "dine_in",
        tableInfo: req.body?.tableInfo || {},
      };

      const normalizedGroup = validateOrderGroup(group, requestGroup, fallbackUserInfo);
      if (normalizedGroup.error) {
        await releaseLockedTables(lockedTables);
        return res.status(400).json({ message: normalizedGroup.error });
      }

      const totalAmount = calculateTotal(group.products);
      const order = new Order({
        cart_id: cartId,
        orderGroupCode,
        restaurant_id: group.restaurantId,
        restaurantInfo: group.restaurantInfo,
        orderType: normalizedGroup.orderType,
        userInfo: normalizedGroup.userInfo,
        tableInfo: normalizedGroup.tableInfo,
        relativeContact: normalizedGroup.relativeContact,
        products: group.products,
        totalAmount,
        depositAmount: normalizedGroup.orderType === "dine_in" ? DEPOSIT_AMOUNT : 0,
        depositStatus: normalizedGroup.orderType === "dine_in" ? "demo_paid" : "not_required",
        orderId: generateHelper.generateRandomOrderId(5),
      });

      if (normalizedGroup.orderType === "dine_in") {
        const lockResult = await lockTableForSlot(
          group.restaurantId,
          normalizedGroup.tableInfo,
          order._id,
          normalizedGroup.relativeContact
        );

        if (lockResult.error) {
          await releaseLockedTables(lockedTables);
          return res.status(400).json({ message: lockResult.error });
        }

        order.tableInfo.area = lockResult.table.area || order.tableInfo.area;
        order.bookingSlotKey = lockResult.slotKey;
        lockedTables.push({
          tableId: lockResult.table._id,
          orderId: order._id,
        });
      }

      await order.save();
      await updateRestaurantStats(group.restaurantId, totalAmount);
      await updateProductSoldCount(group.products);
      createdOrders.push(order);
    }

    await Cart.updateOne(
      { _id: cartId },
      {
        products: [],
        restaurant_id: null,
        restaurant_ids: [],
      }
    );

    return res.status(200).json({
      message: "Dat hang thanh cong",
      orderId: createdOrders[0]?._id || "",
      orderGroupCode,
      orders: createdOrders,
    });
  } catch (error) {
    await releaseLockedTables(lockedTables);
    console.error(error);
    return res.status(500).json({ message: "Khong the tao don hang" });
  }
};

module.exports.success = async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });

  if (!order) {
    return res.status(404).json({ message: "Khong tim thay don hang" });
  }

  if (order.orderGroupCode) {
    const orders = await Order.find({ orderGroupCode: order.orderGroupCode }).sort({ createdAt: 1 });
    return res.status(200).json({
      type: "group",
      orderGroupCode: order.orderGroupCode,
      orders,
    });
  }

  return res.status(200).json({
    type: "single",
    order,
  });
};

module.exports.doneOrder = async (req, res) => {
  const cartId = req.cookies.cartId;
  const orders = await Order.find({ cart_id: cartId }).sort({ createdAt: -1 });

  const groups = new Map();
  for (const order of orders) {
    const groupCode = order.orderGroupCode || order._id.toString();
    if (!groups.has(groupCode)) {
      groups.set(groupCode, {
        orderGroupCode: order.orderGroupCode || "",
        orders: [],
        createdAt: order.createdAt,
      });
    }

    groups.get(groupCode).orders.push(order);
  }

  const groupedOrders = Array.from(groups.values()).map((group) => ({
    ...group,
    totalAmount: group.orders.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0),
  }));

  return res.status(200).json(groupedOrders);
};
