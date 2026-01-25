const Cart = require("../../models/cart.model")

//[POST] /cart/add
module.exports.addPost = async (req, res) => {
    const cartId = req.cookies.cartId;
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({
        _id: cartId
    })

    const exitProductInCart = cart.products.find(item => item.product_id == productId)
    if (exitProductInCart) {
        // console.log("vào đây")
        const newQuantity = parseInt(quantity) + exitProductInCart.quantity;
        // console.log(newQuantity)
        await Cart.updateOne(
            {
                _id: cartId,
                'products.product_id': productId
            },
            {
                'products.$.quantity': newQuantity
            }
        )
    } else {
        const objectCart = {
            product_id: productId,
            quantity: parseInt(quantity)
        };
        await Cart.updateOne(
            {
                _id: cartId
            }, {
            $push: {
                products: objectCart
            }
        }
        )
    }


    res.status(200).json({ message: 'Thêm Sản Phẩm Thành Công' });
    console.log(productId, quantity)
    console.log("oke")
} 