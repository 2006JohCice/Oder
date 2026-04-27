const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Order = require("../../models/orders.model");
const Table = require("../../models/table.model");
const generateHelper = require("../../helpers/generate");
const { ensureTables } = require("./table.controllers");

// [GET] /api/checkout
module.exports.index = async (req, res) => {
    return res.status(200).json({ message: "Checkout ready" });
};

// [POST] /api/checkout/order
module.exports.order = async (req, res) => {
    let reservedTableNumber = "";
    let reservedOrderId = "";

    try {
        const cartId = req.cookies.cartId;
        const {
            fullName,
            phone,
            address,
            orderType = "dine_in",
            tableInfo = {}
        } = req.body;

        const normalizedOrderType = orderType === "delivery" ? "delivery" : "dine_in";
        const normalizedTableInfo = normalizedOrderType === "dine_in"
            ? {
                area: tableInfo.area || "",
                tableNumber: tableInfo.tableNumber || "",
                guestCount: Number(tableInfo.guestCount) || 1,
                arrivalTime: tableInfo.arrivalTime || "",
                note: tableInfo.note || ""
            }
            : null;

        const hasBasicInfo = !!fullName && !!phone;
        const hasAddressForDelivery = normalizedOrderType === "delivery" ? !!address : true;
        const hasTableForDineIn = normalizedOrderType === "dine_in" ? !!normalizedTableInfo.tableNumber : true;

        if (!hasBasicInfo || !hasAddressForDelivery || !hasTableForDineIn) {
            return res.status(400).json({
                message: normalizedOrderType === "dine_in"
                    ? "Vui long nhap ho ten, so dien thoai va chon ban an"
                    : "Vui long dien day du thong tin giao hang"
            });
        }

        const cart = await Cart.findOne({ _id: cartId });
        if (!cart || !Array.isArray(cart.products) || cart.products.length === 0) {
            return res.status(400).json({ message: "Gio hang khong hop le hoac rong" });
        }

        const products = [];
        for (const product of cart.products) {
            const productInfo = await Product.findOne({ _id: product.product_id });
            if (!productInfo) continue;

            products.push({
                product_id: product.product_id,
                price: productInfo.price,
                discountPercentage: productInfo.discountPercentage || 0,
                quantity: product.quantity
            });
        }

        if (products.length === 0) {
            return res.status(400).json({ message: "Khong co san pham hop le trong gio hang" });
        }

        const order = new Order({
            cart_id: cartId,
            orderType: normalizedOrderType,
            userInfo: {
                fullName,
                phone,
                address: address || ""
            },
            tableInfo: normalizedTableInfo,
            products,
            orderId: generateHelper.generateRandomOrderId(5)
        });

        reservedOrderId = String(order._id);

        if (normalizedOrderType === "dine_in") {
            await ensureTables();

            const selectedTable = await Table.findOneAndUpdate(
                {
                    tableNumber: normalizedTableInfo.tableNumber,
                    status: "available"
                },
                {
                    status: "occupied",
                    currentOrderId: reservedOrderId
                },
                {
                    new: true
                }
            );

            if (!selectedTable) {
                return res.status(400).json({ message: "Ban nay da co khach, vui long chon ban trong khac" });
            }

            reservedTableNumber = selectedTable.tableNumber;
            order.tableInfo.area = selectedTable.area || order.tableInfo.area;
        }

        await order.save();
        await Cart.updateOne({ _id: cartId }, { products: [] });

        return res.status(200).json({
            message: "Dat hang thanh cong",
            orderId: order._id
        });
    } catch (error) {
        if (reservedTableNumber && reservedOrderId) {
            await Table.updateOne(
                {
                    tableNumber: reservedTableNumber,
                    currentOrderId: reservedOrderId
                },
                {
                    status: "available",
                    currentOrderId: ""
                }
            );
        }

        console.error(error);
        return res.status(500).json({ message: "Khong the tao don hang" });
    }
};

// [GET] /checkout/success/:orderId
module.exports.success = async (req, res) => {
    const order = await Order.findOne({ _id: req.params.orderId });

    if (!order) {
        return res.status(404).json({ message: "Khong tim thay don hang" });
    }

    return res.status(200).json(order);
};

// [GET] /checkout/doneOrder
module.exports.doneOrder = async (req, res) => {
    const cartId = req.cookies.cartId;
    const orders = await Order.find({ cart_id: cartId }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
};
