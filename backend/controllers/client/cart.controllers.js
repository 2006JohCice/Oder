const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");

const ensureCart = async (req, res) => {
  let cartId = req.cookies.cartId;

  if (cartId) {
    const existingCart = await Cart.findOne({ _id: cartId });
    if (existingCart) return existingCart;
  }

  const cart = new Cart({ products: [] });
  await cart.save();

  const expiresTime = 1000 * 60 * 60 * 24 * 14;
  res.cookie("cartId", cart._id.toString(), { expires: new Date(Date.now() + expiresTime) });

  return cart;
};

const addProductToCart = async (cart, productId, quantity, res) => {
  const product = await Product.findOne({ _id: productId, deleted: false });
  if (!product) return { status: 404, payload: { message: "San pham khong ton tai" } };

  const productRestaurantId = product.restaurant_id ? String(product.restaurant_id) : null;

  if (cart.restaurant_id && productRestaurantId && String(cart.restaurant_id) !== productRestaurantId) {
    return {
      status: 409,
      payload: { message: "Gio hang chi duoc chua mon an cua mot nha hang" },
    };
  }

  if (!cart.restaurant_id && productRestaurantId) {
    await Cart.updateOne({ _id: cart._id }, { restaurant_id: product.restaurant_id });
  }

  const existingProductInCart = cart.products.find((item) => String(item.product_id) === String(productId));

  if (existingProductInCart) {
    const newQuantity = Number(quantity) + existingProductInCart.quantity;
    await Cart.updateOne({ _id: cart._id, "products.product_id": productId }, { "products.$.quantity": newQuantity });
  } else {
    await Cart.updateOne(
      { _id: cart._id },
      { $push: { products: { product_id: String(productId), quantity: Number(quantity) } } }
    );
  }

  return { status: 200, payload: { message: "Them san pham thanh cong" } };
};

module.exports.index = async (req, res) => {
  const cart = await ensureCart(req, res);
  const cartData = cart.toObject();

  if (cartData.products.length > 0) {
    for (const item of cartData.products) {
      const productInfo = await Product.findOne({ _id: item.product_id }).lean();
      item.productInfo = productInfo;
    }
  }

  cartData.totalCartPrice = cartData.products.reduce((sum, item) => {
    const price = item.productInfo?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return res.status(200).json(cartData);
};

module.exports.addPost = async (req, res) => {
  const cart = await ensureCart(req, res);
  const { productId, quantity } = req.body || {};
  if (!productId || !quantity) return res.status(400).json({ message: "Thieu thong tin san pham" });

  const result = await addProductToCart(cart, productId, quantity, res);
  return res.status(result.status).json(result.payload);
};

module.exports.addByParam = async (req, res) => {
  const cart = await ensureCart(req, res);
  const { productId } = req.params;
  const quantity = Number(req.body?.quantity || 1);

  const result = await addProductToCart(cart, productId, quantity, res);
  return res.status(result.status).json(result.payload);
};

module.exports.delete = async (req, res) => {
  try {
    const productId = req.params.productId;
    const cart = await ensureCart(req, res);

    await Cart.updateOne({ _id: cart._id }, { $pull: { products: { product_id: productId } } });

    const latest = await Cart.findById(cart._id);
    if (!latest.products.length) {
      await Cart.updateOne({ _id: cart._id }, { restaurant_id: null });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports.updateQuantity = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { quantity } = req.body;
    const cart = await ensureCart(req, res);

    if (quantity <= 0) {
      await Cart.updateOne({ _id: cart._id }, { $pull: { products: { product_id: productId } } });
    } else {
      await Cart.updateOne(
        { _id: cart._id, "products.product_id": productId },
        { "products.$.quantity": parseInt(quantity, 10) }
      );
    }

    const latest = await Cart.findById(cart._id);
    if (!latest.products.length) {
      await Cart.updateOne({ _id: cart._id }, { restaurant_id: null });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
