const mongoose = require("mongoose");
const Cart = require("../../models/cart.model");

module.exports.CartId = async (req, res) => {
  const cartId = req.cookies.cartId;

  if (cartId && mongoose.Types.ObjectId.isValid(cartId)) {
    const cart = await Cart.findById(cartId);
    if (cart) {
      const products = Array.isArray(cart.products) ? cart.products : [];
      cart.totalQuantity = products.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      return res.status(200).json(cart.totalQuantity);
    }
  }

  if (cartId) {
    res.clearCookie("cartId");
  }

  const cart = new Cart({
    products: [],
    restaurant_ids: [],
  });
  await cart.save();

  const expiresTime = 1000 * 60 * 60 * 24 * 14;
  res.cookie("cartId", cart._id.toString(), {
    expires: new Date(Date.now() + expiresTime),
  });

  return res.status(200).json(0);
};
