const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");

const ensureCart = async (req, res) => {
    let cartId = req.cookies.cartId;

    if (cartId) {
        const existingCart = await Cart.findOne({ _id: cartId });
        if (existingCart) {
            return existingCart;
        }
    }

    const cart = new Cart();
    await cart.save();

    const expiresTime = 1000 * 60 * 60 * 24 * 14;
    res.cookie("cartId", cart._id.toString(), {
        expires: new Date(Date.now() + expiresTime)
    });

    return cart;
};

// [GET] /cart
module.exports.index = async (req, res) => {
    const cart = await ensureCart(req, res);
    const cartData = cart.toObject();

    if (cartData.products.length > 0) {
        for (const item of cartData.products) {
            const productInfo = await Product.findOne({
                _id: item.product_id
            }).lean();

            item.productInfo = productInfo;
        }
    }

    cartData.totalCartPrice = cartData.products.reduce((sum, item) => {
        const price = item.productInfo?.price || 0;
        return sum + price * item.quantity;
    }, 0);

    return res.status(200).json(cartData);
};

// [POST] /cart/add
module.exports.addPost = async (req, res) => {
    const cart = await ensureCart(req, res);
    const cartId = cart._id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
        return res.status(400).json({ message: "Thieu thong tin san pham" });
    }

    const existingProductInCart = cart.products.find((item) => item.product_id == productId);
    if (existingProductInCart) {
        const newQuantity = parseInt(quantity, 10) + existingProductInCart.quantity;

        await Cart.updateOne(
            {
                _id: cartId,
                "products.product_id": productId
            },
            {
                "products.$.quantity": newQuantity
            }
        );
    } else {
        await Cart.updateOne(
            {
                _id: cartId
            },
            {
                $push: {
                    products: {
                        product_id: productId,
                        quantity: parseInt(quantity, 10)
                    }
                }
            }
        );
    }

    return res.status(200).json({ message: "Them san pham thanh cong" });
};

// [DELETE] /cart/delete/:productId
module.exports.delete = async (req, res) => {
    try {
        const productId = req.params.productId;
        const cart = await ensureCart(req, res);

        await Cart.updateOne(
            { _id: cart._id },
            { $pull: { products: { product_id: productId } } }
        );

        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};
