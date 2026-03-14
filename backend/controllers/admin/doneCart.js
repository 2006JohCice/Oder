const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Order = require("../../models/orders.model");
const mongoose = require("mongoose");
module.exports.doneOrder = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({
      orders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu" });
  }
};
module.exports.authenOrder = async (req, res) => {
  try {
    const { orderNew } = req.body;

    if (!orderNew || orderNew.length === 0) {
      return res.status(400).json({
        message: "Không có đơn hàng nào để cập nhật",
      });
    }

    for (const order of orderNew) {
      const [idOrder, status, orderCode] = order;

      await Order.updateOne(
        { _id: idOrder },
        { orderStatus: status }
      );
    }

    return res.status(200).json({
      message: "Cập nhật trạng thái đơn hàng thành công",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};