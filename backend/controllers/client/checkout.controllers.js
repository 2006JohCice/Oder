const Cart = require("../../models/cart.model")
const Product = require("../../models/product.model")
const Order = require("../../models/orders.model")
const generateHelper = require("../../helpers/generate")


// [GET] /api/checkout
module.exports.index = async (req, res) => {
    console.log("Oke")
}
// [POST] /api/checkout/order
module.exports.order = async (req, res) => {
    const cartId = req.cookies.cartId;
    const userInfo = req.body;
    if (userInfo.phone && userInfo.fullName && userInfo.address) {
        const cart = await Cart.findOne({ _id: cartId });
        if (!cart || !Array.isArray(cart.products) || cart.products.length === 0) {
            return res.status(400).json({ message: "Giỏ hàng không hợp lệ hoặc rỗng" });
        }

        let products = [];
        for (const product of cart.products) {
            const productInfo = await Product.findOne({ _id: product.product_id });
            if (!productInfo) continue;
            products.push({
                product_id: product.product_id,
                price: productInfo.price,
                discountPercentage: productInfo.discountPercentage || 0,
                quantity: product.quantity
            });
        }

        if (products.length === 0) {
            return res.status(400).json({ message: "Không có sản phẩm hợp lệ trong giỏ hàng" });
        }

        const objectOrder = {
            cart_id: cartId,
            userInfo: userInfo,
            products: products,
            orderId: generateHelper.generateRandomOrderId(5),
        };
        const order = new Order(objectOrder);
        await order.save();
        await Cart.updateOne({ _id: cartId }, { products: [] });

        res.status(200).json({
            message: "Đặt hàng thành công",
            orderId: order._id
        });
        // console.log("order", objectOrder);
    } else {
        res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
    }
};


//[GET] /checkout/success/:id
module.exports.success = async (req, res) => {
    console.log("idOrder",req.params.orderId)
    const order = await Order.findOne({ _id: req.params.orderId });
    if(order){
        res.status(200).json(order);
    }else{
        res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    // console.log("Order", order)

}
//[GET] /checkout/doneOrder
module.exports.doneOrder = async (req, res) => {
    const cartId = req.cookies.cartId;
    const orders = await Order.find({ cart_id: cartId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
}
// [PATCH] /checkout/authenOrder
module.exports.authenOrder = async (req, res) => {
  const { ordersAuthen } = req.body;

  console.log(ordersAuthen);


  res.json({
    success: true,
    message: "Cập nhật trạng thái thành công",
  });
};