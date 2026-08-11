const mongoose = require("mongoose");
const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Restaurant = require("../../models/restaurant.model");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getRestaurantIdFromValue = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value._id) return String(value._id);
  return "";
};

const ensureCart = async (req, res) => {
  const cartId = req.cookies.cartId;

  if (cartId && isValidObjectId(cartId)) {
    const existingCart = await Cart.findById(cartId);
    if (existingCart) {
      if (!Array.isArray(existingCart.products)) {
        existingCart.products = [];
        await existingCart.save();
      }
      return existingCart;
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

  return cart;
};

const normalizeCartRestaurants = (cartData) => {
  return [
    ...new Set(
      (cartData.products || [])
        .map((item) => item.restaurant_id || getRestaurantIdFromValue(item.productInfo?.restaurant_id))
        .filter(Boolean)
        .map((id) => String(id))
    ),
  ];
};

const hydrateCart = async (cart) => {
  const cartData = cart.toObject();
  const rawProducts = Array.isArray(cartData.products) ? cartData.products : [];
  const sanitizedProducts = [];

  for (const item of rawProducts) {
    if (!item?.product_id || !isValidObjectId(item.product_id)) {
      continue;
    }

    const productInfo = await Product.findOne({
      _id: item.product_id,
      deleted: false,
    })
      .populate("restaurant_id", "name phone address location ratingAverage ratingCount orderCount slug")
      .lean();

    if (!productInfo) {
      continue;
    }

    sanitizedProducts.push({
      ...item,
      quantity: Number(item.quantity || 0),
      productInfo,
      restaurant_id: getRestaurantIdFromValue(productInfo.restaurant_id) || null,
      restaurantInfo: productInfo.restaurant_id || null,
    });
  }

  if (sanitizedProducts.length !== rawProducts.length) {
    await Cart.updateOne(
      { _id: cart._id },
      {
        products: sanitizedProducts.map((item) => ({
          product_id: String(item.product_id),
          quantity: Number(item.quantity || 0),
        })),
      }
    );
  }

  cartData.products = sanitizedProducts;
  cartData.restaurant_ids = normalizeCartRestaurants(cartData);
  cartData.restaurant_id = cartData.restaurant_ids[0] || null;
  cartData.totalCartPrice = sanitizedProducts.reduce((sum, item) => {
    const price = Number(item.productInfo?.price || 0);
    return sum + price * Number(item.quantity || 0);
  }, 0);

  const restaurantGroupsMap = new Map();
  for (const item of sanitizedProducts) {
    const restaurantInfo = item.restaurantInfo;
    const restaurantId = item.restaurant_id || "no-restaurant";

    if (!restaurantGroupsMap.has(restaurantId)) {
      restaurantGroupsMap.set(restaurantId, {
        restaurantId: restaurantId === "no-restaurant" ? "" : restaurantId,
        restaurantName: restaurantInfo?.name || "Nhà hàng không xác định",
        restaurantSlug: restaurantInfo?.slug || "default",
        restaurantPhone: restaurantInfo?.phone || "",
        restaurantAddress: restaurantInfo?.address || "",
        restaurantLocation: restaurantInfo?.location || { lat: 21.028511, lng: 105.804817 },
        ratingAverage: Number(restaurantInfo?.ratingAverage || 0),
        ratingCount: Number(restaurantInfo?.ratingCount || 0),
        orderCount: Number(restaurantInfo?.orderCount || 0),
        products: [],
        totalQuantity: 0,
        totalAmount: 0,
      });
    }

    const group = restaurantGroupsMap.get(restaurantId);
    group.products.push(item);
    group.totalQuantity += Number(item.quantity || 0);
    group.totalAmount += Number(item.productInfo?.price || 0) * Number(item.quantity || 0);
  }

  cartData.restaurantGroups = Array.from(restaurantGroupsMap.values());
  return cartData;
};

const syncCartRestaurantIds = async (cartId, cartData) => {
  const restaurantIds = cartData.restaurant_ids || [];
  await Cart.updateOne(
    { _id: cartId },
    {
      restaurant_id: restaurantIds[0] || null,
      restaurant_ids: restaurantIds,
    }
  );
};

const addProductToCart = async (cart, productId, quantity) => {
  if (!isValidObjectId(productId)) {
    return { status: 400, payload: { message: "ID sản phẩm không hợp lệ" } };
  }

  const normalizedQuantity = Number(quantity);
  if (!normalizedQuantity || normalizedQuantity <= 0) {
    return { status: 400, payload: { message: "Số lượng sản phẩm không hợp lệ" } };
  }

  const product = await Product.findOne({ _id: productId, deleted: false });
  if (!product) {
    return { status: 404, payload: { message: "Sản phẩm không tồn tại" } };
  }

  // Check if restaurant is closed
  if (product.restaurant_id && isValidObjectId(product.restaurant_id)) {
    const restaurant = await Restaurant.findOne({ _id: product.restaurant_id, deleted: false });
    if (restaurant && restaurant.openTime && restaurant.closeTime) {
      const now = new Date();
      const currentTime = now.getHours() + now.getMinutes() / 60;
      
      const [openH, openM] = restaurant.openTime.split(":").map(Number);
      const openTime = openH + openM / 60;
      
      const [closeH, closeM] = restaurant.closeTime.split(":").map(Number);
      const closeTime = closeH + closeM / 60;
      
      let isClosed = false;
      if (closeTime < openTime) {
        if (currentTime >= closeTime && currentTime < openTime) isClosed = true;
      } else {
        if (currentTime < openTime || currentTime >= closeTime) isClosed = true;
      }

      if (isClosed) {
        return { status: 400, payload: { message: "Nhà hàng đã đóng cửa" } };
      }
    }
  }

  const currentProducts = Array.isArray(cart.products) ? cart.products : [];
  const existingProductInCart = currentProducts.find(
    (item) => String(item.product_id) === String(productId)
  );

  if (existingProductInCart) {
    const newQuantity = Number(existingProductInCart.quantity || 0) + normalizedQuantity;
    await Cart.updateOne(
      { _id: cart._id, "products.product_id": productId },
      { "products.$.quantity": newQuantity }
    );
  } else {
    await Cart.updateOne(
      { _id: cart._id },
      { $push: { products: { product_id: String(productId), quantity: normalizedQuantity } } }
    );
  }

  const latest = await Cart.findById(cart._id);
  const hydrated = await hydrateCart(latest);
  await syncCartRestaurantIds(cart._id, hydrated);

  return {
    status: 200,
    payload: {
      message: "Thêm sản phẩm thành công",
      cart: hydrated,
    },
  };
};

module.exports.index = async (req, res) => {
  try {
    const cart = await ensureCart(req, res);
    const cartData = await hydrateCart(cart);
    await syncCartRestaurantIds(cart._id, cartData);
    return res.status(200).json(cartData);
  } catch (error) {
    console.error("Cart index error:", error);
    return res.status(500).json({ message: "Không thể tải giỏ hàng" });
  }
};

module.exports.addPost = async (req, res) => {
  try {
    const cart = await ensureCart(req, res);
    console.log(cart)
    const { productId, quantity } = req.body || {};

    if (!productId || quantity === undefined) {
      return res.status(400).json({ message: "Thiếu thông tin sản phẩm" });
    }

    const result = await addProductToCart(cart, productId, quantity);
    return res.status(200).json(
      {
        message: "Thêm sản phẩm thành công"
      }
      
    );
  } catch (error) {
    console.error("Cart addPost error:", error);
    return res.status(500).json({ message: "Không thể thêm sản phẩm vào giỏ hàng" });
  }
};

module.exports.addByParam = async (req, res) => {
  try {
    const cart = await ensureCart(req, res);
    const { productId } = req.params;
    const quantity = Number(req.body?.quantity || 1);

    const result = await addProductToCart(cart, productId, quantity);
    return res.status(200).json(result.payload);
  } catch (error) {
    console.error("Cart addByParam error:", error);
    return res.status(500).json({ message: "Không thể thêm sản phẩm vào giỏ hàng" });
  }
};

module.exports.delete = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await ensureCart(req, res);

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "ID sản phẩm không hợp lệ" });
    }

    await Cart.updateOne(
      { _id: cart._id },
      { $pull: { products: { product_id: String(productId) } } }
    );

    const latest = await Cart.findById(cart._id);
    const hydrated = await hydrateCart(latest);
    await syncCartRestaurantIds(cart._id, hydrated);

    return res.status(200).json({ success: true, cart: hydrated });
  } catch (error) {
    console.error("Cart delete error:", error);
    return res.status(500).json({ success: false, message: "Không thể xóa sản phẩm khỏi giỏ hàng" });
  }
};

module.exports.updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const normalizedQuantity = Number(req.body?.quantity);
    const cart = await ensureCart(req, res);

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "ID sản phẩm không hợp lệ" });
    }

    if (!normalizedQuantity || normalizedQuantity <= 0) {
      await Cart.updateOne(
        { _id: cart._id },
        { $pull: { products: { product_id: String(productId) } } }
      );
    } else {
      await Cart.updateOne(
        { _id: cart._id, "products.product_id": String(productId) },
        { "products.$.quantity": parseInt(normalizedQuantity, 10) }
      );
    }

    const latest = await Cart.findById(cart._id);
    const hydrated = await hydrateCart(latest);
    await syncCartRestaurantIds(cart._id, hydrated);

    return res.status(200).json({ success: true, cart: hydrated });
  } catch (error) {
    console.error("Cart updateQuantity error:", error);
    return res.status(500).json({ success: false, message: "Không thể cập nhật số lượng" });
  }
};

module.exports.clearGroup = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const cart = await ensureCart(req, res);
    const currentProducts = Array.isArray(cart.products) ? cart.products : [];
    const nextProducts = [];

    for (const item of currentProducts) {
      if (!item?.product_id || !isValidObjectId(item.product_id)) {
        continue;
      }

      const product = await Product.findById(item.product_id).select("restaurant_id");
      const productRestaurantId = product?.restaurant_id ? String(product.restaurant_id) : "";
      if (productRestaurantId !== String(restaurantId)) {
        nextProducts.push({
          product_id: String(item.product_id),
          quantity: Number(item.quantity || 0),
        });
      }
    }

    await Cart.updateOne({ _id: cart._id }, { products: nextProducts });
    const latest = await Cart.findById(cart._id);
    const hydrated = await hydrateCart(latest);
    await syncCartRestaurantIds(cart._id, hydrated);

    return res.status(200).json({ success: true, cart: hydrated });
  } catch (error) {
    console.error("Cart clearGroup error:", error);
    return res.status(500).json({ success: false, message: "Không thể xóa nhóm nhà hàng" });
  }
};

module.exports.getRestaurantSummary = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.restaurantIds) ? req.body.restaurantIds : [];
    if (ids.length === 0) {
      return res.status(200).json({ restaurants: [] });
    }

    const validIds = ids.filter((id) => isValidObjectId(id));
    const restaurants = await Restaurant.find({
      _id: { $in: validIds },
      deleted: false,
    }).select("name address phone ratingAverage ratingCount orderCount");

    return res.status(200).json({ restaurants });
  } catch (error) {
    console.error("Cart getRestaurantSummary error:", error);
    return res.status(500).json({ message: "Không thể lấy thông tin nhà hàng" });
  }
};
