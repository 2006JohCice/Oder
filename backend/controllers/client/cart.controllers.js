const Cart = require("../../models/cart.model")
const Product = require("../../models/product.model")


//[GET] /cart
module.exports.index = async (req, res) => {

    const cartId = req.cookies.cartId;
    const cart = await Cart.findOne({
        _id: cartId
    }).lean();
    if (cart.products.length > 0) {
        for (const item of cart.products) {
            const productId = item.product_id;

            const productInfo = await Product.findOne({
                _id: productId
            }).lean();
            item.productInfo = productInfo;
            // item.totalPrice = item.quantity * productInfo.price

        }


    }

    // cart.totalCartPrice = cart.products.reduce( (sum, item) =>  sum + (item.productInfo ? item.totalPrice : 0),    0  );
    cart.totalCartPrice = cart.products.reduce( (sum, item) =>  sum + (item.productInfo.price * item.quantity),    0  );

    return res.status(200).json(cart)
}

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

//[DELETE] /cart/delete/productsId
module.exports.delete = async (req, res) => {
  try {
    const productId = req.params.productId;
    const cartId = req.cookies.cartId;
 console.log(productId)
    await Cart.updateOne(
      { _id: cartId },
      { "$pull": { products: {"product_id": productId } } }
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }

 
};


