const Cart = require("../../models/cart.model");

module.exports.CartId = async (req, res, next) => {

    if (req.cookies.cartId) {
        return next();
    }
    const cart = new Cart();
    await cart.save();
    // console.log(cart)
    const expiresTime = 1000 * 60 * 60 * 24 * 14;
    res.cookie("cartId", cart._id.toString(),{
        expires: new Date(Date.now() + expiresTime)
    });

    return next();
    
};
