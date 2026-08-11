const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Order = require("../../models/orders.model");
const Table = require("../../models/table.model");
const Restaurant = require("../../models/restaurant.model");
const User = require("../../models/user.model");
const Voucher = require("../../models/voucher.model");
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
    return { error: "Vui lòng nhập họ tên và số điện thoại cho từng nhà hàng." };
  }

  if (orderType === "delivery" && !userInfo.address) {
    return { error: `Vui lòng nhập địa chỉ giao hàng cho ${group.restaurantInfo.name}.` };
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
      return { error: `Vui lòng chọn bàn, ngày và giờ đến cho ${group.restaurantInfo.name}.` };
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

  const tableNumbers = String(tableInfo.tableNumber || "").split(",").map(t => t.trim()).filter(Boolean);

  const selectedTables = await Table.find({
    restaurant_id: restaurantId,
    tableNumber: { $in: tableNumbers },
  });

  if (selectedTables.length === 0 || selectedTables.length !== tableNumbers.length) {
    return { error: "Một hoặc nhiều bàn không tồn tại trong nhà hàng đã chọn." };
  }

  const conflictingOrders = await Order.find({
    restaurant_id: restaurantId,
    orderType: "dine_in",
    bookingSlotKey: slotKey,
    orderStatus: { $nin: ["completed", "cancelled"] },
  }).select("tableInfo relativeContact");

  let allBookedTableNumbers = [];
  conflictingOrders.forEach(order => {
      const nums = (order.tableInfo?.tableNumber || "").split(",").map(t => t.trim());
      allBookedTableNumbers.push(...nums);
  });

  const exactSameTable = tableNumbers.find(t => allBookedTableNumbers.includes(t));

  if (exactSameTable) {
    return { error: "Một trong số các bàn bạn chọn đã được đặt trong cùng khung giờ, vui lòng chọn bàn khác." };
  }

  for (const t of selectedTables) {
      await Table.updateOne(
        { _id: t._id },
        {
          status: "occupied",
          currentOrderId: String(orderId),
        }
      );
  }

  return {
    tables: selectedTables,
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

    const cart = await Cart.findOne({
      _id: cartId,
    });

    const groupRequests = Array.isArray(
      req.body?.restaurantOrders
    )
      ? req.body.restaurantOrders
      : [];

    const isPureTableBooking = groupRequests.length > 0 && groupRequests.every(r => r.orderType === "dine_in");

    if (
      (!cart ||
      !Array.isArray(cart.products) ||
      cart.products.length === 0) && !isPureTableBooking
    ) {
      return res.status(400).json({
        message: "Giỏ hàng không hợp lệ hoặc đang trống",
      });
    }

    const fallbackUserInfo = {
      fullName: req.body?.fullName || "",
      phone: req.body?.phone || "",
      address: req.body?.address || "",
    };

    let groupedProducts =
      cart && Array.isArray(cart.products) ? await mapProductsByRestaurant(
        cart.products
      ) : [];

    if (req.body?.isPartialCheckout) {
       const reqRestaurantIds = groupRequests.map(r => String(r.restaurantId));
       groupedProducts = groupedProducts.filter(g => reqRestaurantIds.includes(String(g.restaurantId)));
    }

    if (groupedProducts.length === 0) {
      if (!isPureTableBooking) {
        return res.status(400).json({
          message:
            "Không có sản phẩm hợp lệ trong giỏ hàng",
        });
      }
      // Create fake groups for table booking
      for (const reqGroup of groupRequests) {
        const restaurant = await Restaurant.findOne({ _id: reqGroup.restaurantId });
        groupedProducts.push({
          restaurantId: reqGroup.restaurantId,
          restaurantInfo: {
             name: restaurant?.name || "",
             phone: restaurant?.phone || "",
             address: restaurant?.address || ""
          },
          products: []
        });
      }
    }

    const orderGroupCode =
      generateHelper.generateRandomOrderId(
        8
      );

    const createdOrders = [];
    let totalCartAmount = 0;

    for (const group of groupedProducts) {
      const requestGroup =
        ensureGroupRequest(
          groupRequests,
          group.restaurantId
        ) || {
          restaurantId: group.restaurantId,

          fullName:
            fallbackUserInfo.fullName,

          phone:
            fallbackUserInfo.phone,

          address:
            fallbackUserInfo.address,

          orderType:
            req.body?.orderType ||
            "dine_in",

          tableInfo:
            req.body?.tableInfo || {},
        };

      const normalizedGroup =
        validateOrderGroup(
          group,
          requestGroup,
          fallbackUserInfo
        );

      if (normalizedGroup.error) {
        await releaseLockedTables(
          lockedTables
        );

        return res.status(400).json({
          message:
            normalizedGroup.error,
        });
      }

      let totalAmount =
        calculateTotal(group.products);
        
      /* =========================
         FIX 9 - VOUCHER SYSTEM
      ========================= */
      let discountAmount = 0;
      let appliedVoucherId = null;

      if (requestGroup.voucherCode) {
        const voucher = await Voucher.findOne({
          code: String(requestGroup.voucherCode).toUpperCase(),
          $or: [
            { restaurant_id: group.restaurantId },
            { restaurant_id: null }
          ],
          status: 'active',
          deleted: false
        });

        if (voucher) {
          const now = new Date();
          if (new Date(voucher.expirationDate) > now) {
            if (voucher.maxUsage === 0 || voucher.usedCount < voucher.maxUsage) {
               let userId = null;
               if (req.cookies.tokenUser) {
                  const user = await User.findOne({ tokenUser: req.cookies.tokenUser });
                  if (user) userId = user._id;
               }
               
               if (!userId || (userId && !voucher.usedBy.includes(userId))) {
                  if (totalAmount >= voucher.minOrderValue) {
                     if (voucher.discountType === 'amount') {
                        discountAmount = voucher.discountValue;
                     } else {
                        let pctDiscount = (totalAmount * voucher.discountValue) / 100;
                        if (voucher.maxDiscountAmount && pctDiscount > voucher.maxDiscountAmount) {
                           pctDiscount = voucher.maxDiscountAmount;
                        }
                        discountAmount = pctDiscount;
                     }
                     appliedVoucherId = voucher._id;
                     
                     const updateQuery = { $inc: { usedCount: 1 } };
                     if (userId) {
                         updateQuery.$push = { usedBy: userId };
                     }
                     await Voucher.updateOne({ _id: voucher._id }, updateQuery);
                  }
               }
            }
          }
        }
      }

      totalAmount -= discountAmount;
      if (totalAmount < 0) totalAmount = 0;
      
      totalCartAmount += totalAmount;

      /* =========================
         FIX 8 - BOOKING SLOT KEY
      ========================= */
      let bookingSlotKey = null;
      if (normalizedGroup.orderType === "dine_in") {
          bookingSlotKey = `${normalizedGroup.tableInfo.visitDate}_${normalizedGroup.tableInfo.arrivalTime}`;
      }

      const order = new Order({
        cart_id: cartId,

        orderGroupCode,

        restaurant_id:
          group.restaurantId,

        restaurantInfo:
          group.restaurantInfo,

        orderType:
          normalizedGroup.orderType,

        userInfo:
          normalizedGroup.userInfo,

        tableInfo:
          normalizedGroup.tableInfo,

        relativeContact:
          normalizedGroup.relativeContact,

        products: group.products,

        totalAmount,
        discountAmount,
        voucher_id: appliedVoucherId,

        depositAmount:
          normalizedGroup.orderType ===
          "dine_in"
            ? DEPOSIT_AMOUNT
            : 0,

        depositStatus:
          normalizedGroup.orderType ===
          "dine_in"
            ? "demo_paid"
            : "not_required",

        orderId:
          generateHelper.generateRandomOrderId(
            5
          ),

        /* =========================
           FIX 8 - BOOKING SLOT KEY
        ========================= */

        bookingSlotKey,
      });

      if (
        normalizedGroup.orderType ===
        "dine_in"
      ) {
        const lockResult =
          await lockTableForSlot(
            group.restaurantId,

            normalizedGroup.tableInfo,

            order._id,

            normalizedGroup.relativeContact
          );

        if (lockResult.error) {
          await releaseLockedTables(
            lockedTables
          );

          return res.status(400).json({
            message:
              lockResult.error,
          });
        }

        order.tableInfo.area =
          lockResult.tables.map(t => t.area || "").filter(Boolean).join(", ") ||
          order.tableInfo.area;
          
        order.tableInfo.displayName =
          lockResult.tables.map(t => t.displayName || t.tableNumber).join(", ");

        order.bookingSlotKey =
          lockResult.slotKey;

        lockResult.tables.forEach(t => {
            lockedTables.push({
              tableId:
                t._id,
              orderId: order._id,
            });
        });
      }

      await order.save();

      await updateRestaurantStats(
        group.restaurantId,
        totalAmount
      );

      await updateProductSoldCount(
        group.products
      );

      createdOrders.push(order);
    }

    if (req.body?.isPartialCheckout) {
      const checkedOutProductIds = [];
      groupedProducts.forEach(g => {
        g.products.forEach(p => checkedOutProductIds.push(String(p.product_id)));
      });
      const remainingProducts = cart.products.filter(p => !checkedOutProductIds.includes(String(p.product_id)));
      await Cart.updateOne({ _id: cartId }, { products: remainingProducts });
    } else {
      await Cart.updateOne(
        { _id: cartId },
        {
          products: [],
          restaurant_id: null,
          restaurant_ids: [],
        }
      );
    }

    // ===================================
    // THƯỞNG ĐIỂM CHO THÀNH VIÊN (RANK SYSTEM)
    // ===================================
    if (req.cookies.tokenUser) {
        const user = await User.findOne({ tokenUser: req.cookies.tokenUser, deleted: false });
        if (user) {
            // Lợi nhuận của sàn giả sử là 10% tổng đơn, trích 50% lợi nhuận đó thành điểm thưởng (tức 5% tổng đơn)
            const profit = totalCartAmount * 0.10;
            const pointsToAdd = Math.floor(profit * 0.50) || 10;
            await User.updateOne({ _id: user._id }, { $inc: { points: pointsToAdd } });
        }
    }

    return res.status(200).json({
      message:
        "Đặt hàng thành công",

      orderId:
        createdOrders[0]?._id || "",

      orderGroupCode,

      orders: createdOrders,
    });
  } catch (error) {
    await releaseLockedTables(
      lockedTables
    );

    console.error(error);

    return res.status(500).json({
      message:
        "Không thể tạo đơn hàng",
    });
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

module.exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const cartId = req.cookies.cartId;

    // Find all orders in this order group or just the single order
    // But success page uses orderId, which might be a single order or orderGroupCode
    // We'll search by either _id or orderGroupCode
    const query = {
      cart_id: cartId,
      $or: [
        { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null },
        { orderGroupCode: orderId }
      ]
    };

    const orders = await Order.find(query);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    let isOver2Mins = false;
    let anyDineIn = false;
    const now = Date.now();

    for (const order of orders) {
      if (['completed', 'cancelled', 'shipping', 'delivering'].includes(order.orderStatus)) {
        return res.status(400).json({ message: "Đơn hàng ở trạng thái không thể hủy." });
      }

      if (order.orderType === "dine_in") {
        anyDineIn = true;
      }

      const diffMins = (now - new Date(order.createdAt).getTime()) / 60000;
      if (diffMins > 2) {
        isOver2Mins = true;
      }
    }

    // Process cancellation
    for (const order of orders) {
      const cancelReason = isOver2Mins ? "Hủy sau 2 phút - Mất cọc" : "Hủy trước 2 phút";
      
      await Order.updateOne(
        { _id: order._id },
        { 
          $set: { 
            orderStatus: 'cancelled',
            cancelReason: cancelReason
          } 
        }
      );

      // Release locked tables
      if (order.orderType === "dine_in" && order.tableInfo?.tableNumber) {
        const tableNumbers = String(order.tableInfo.tableNumber).split(',').map(t => t.trim()).filter(Boolean);
        await Table.updateMany(
          { 
            restaurant_id: order.restaurant_id, 
            tableNumber: { $in: tableNumbers }
          },
          { 
            $set: { 
              status: "available",
              orderType: "none",
              bookingSlotKey: null
            },
            $unset: { 
              currentOrderId: 1,
              relativeContact: 1,
              tableInfo: 1
            }
          }
        );
      }
    }

    return res.status(200).json({ 
      message: isOver2Mins ? "Đơn hàng đã hủy. Bạn bị mất cọc do quá 2 phút." : "Đã hủy đơn hàng thành công.",
      isPenalty: isOver2Mins
    });

  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi hủy đơn" });
  }
};
