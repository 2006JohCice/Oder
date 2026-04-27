const Order = require("../../models/orders.model");
const Table = require("../../models/table.model");

module.exports.doneOrder = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({
      orders,
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
        const tablePayload = status === "completed"
          ? { status: "available", currentOrderId: "" }
          : { status: "occupied", currentOrderId: String(currentOrder._id) };

        await Table.updateOne(
          { tableNumber: currentOrder.tableInfo.tableNumber },
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
