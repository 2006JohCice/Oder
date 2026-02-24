const Cart = require("../../models/cart.model")
const Product = require("../../models/product.model")
const Order = require("../../models/orders.model")


module.exports.doneOrder = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu' });
    }
}