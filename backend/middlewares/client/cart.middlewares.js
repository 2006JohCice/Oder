const Cart = require("../../models/cart.model");

module.exports.CartId = async (req, res, next) => {

    if (req.cookies.cartId) {
        const cart = await Cart.findOne({
            _id: req.cookies.cartId
        })

        cart.totalQuantity = cart.products.reduce((sum, item) => sum + item.quantity, 0)
        // console.log("Nó ở đây: ", cart.totalQuantity)
        return res.status(200).json(cart.totalQuantity);
    }
    const cart = new Cart();
    await cart.save();
    // console.log(cart)
    const expiresTime = 1000 * 60 * 60 * 24 * 14;
    res.cookie("cartId", cart._id.toString(), {
        expires: new Date(Date.now() + expiresTime)
    });

    return next();

};
