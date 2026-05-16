const Order = require("../../models/orders.model");
const Table = require("../../models/table.model");

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

module.exports.doneOrder = async (req, res) => {
  try {
    const { q = "", status = "", type = "", page = 1, limit = 10 } = req.query;
    const allOrders = await Order.find().sort({ createdAt: -1 }).lean();

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
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
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

module.exports.authenOrder = async (req, res) => {
  try {
    const { orderNew } = req.body;

    if (!orderNew || orderNew.length === 0) {
      return res.status(400).json({
        message: "Khong co don hang nao de cap nhat",
      });
    }

    for (const order of orderNew) {
      const [idOrder, status] = order;
      const currentOrder = await Order.findOne({ _id: idOrder });

      if (!currentOrder) {
        continue;
      }

      if (currentOrder.orderType === "dine_in" && currentOrder.tableInfo?.tableNumber) {
        const tablePayload =
          status === "completed" || status === "cancelled"
            ? { status: "available", currentOrderId: "" }
            : { status: "occupied", currentOrderId: String(currentOrder._id) };

        await Table.updateOne(
          {
            restaurant_id: currentOrder.restaurant_id,
            tableNumber: currentOrder.tableInfo.tableNumber,
          },
          tablePayload
        );
      }

      await Order.updateOne(
        { _id: idOrder },
        { orderStatus: status }
      );
    }

    return res.status(200).json({
      message: "Cap nhat trang thai don hang thanh cong",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Loi server",
    });
  }
};
