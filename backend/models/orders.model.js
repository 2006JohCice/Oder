const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        cart_id: String,
        orderId: String,
        orderStatus: {
            type: String,
            default: "pending"
        },
        orderType: {
            type: String,
            default: "dine_in"
        },
        userInfo: {
            fullName: String, 
            phone: String,
            address: String,
        },
        tableInfo: {
            area: String,
            tableNumber: String,
            guestCount: Number,
            arrivalTime: String,
            note: String
        },
        products: [
            {
                product_id: String,
                price: Number,
                discountPercentage: Number,
                quantity: Number
            }
        ]
    },
    {
        timestamps: true
    });

const Order = mongoose.model('Order', orderSchema, 'orders'); 

module.exports = Order;
