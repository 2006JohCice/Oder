// const Cart = require("../../models/cart.model");

// module.exports.CartId = async (req, res, next) => {

//     if (req.cookies.cartId) {
//         return next();
//     }
//     const cart = new Cart();
//     await cart.save();
//     console.log(cart)
//     res.cookie("cartId", cart._id.toString());

//     return next();
// };
