const Cart = require("../../models/cart.model");

module.exports.CartId = async (req, res) => {
    if (req.cookies.cartId) {
        const cart = await Cart.findOne({
            _id: req.cookies.cartId
        });

        if (cart) {
            cart.totalQuantity = cart.products.reduce((sum, item) => sum + item.quantity, 0);
            return res.status(200).json(cart.totalQuantity);
        }
    }

    const cart = new Cart();
    await cart.save();

    const expiresTime = 1000 * 60 * 60 * 24 * 14;
    res.cookie("cartId", cart._id.toString(), {
        expires: new Date(Date.now() + expiresTime)
    });

    return res.status(200).json(0);
};
