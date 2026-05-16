const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        cart_id: String,
        orderGroupCode: {
          type: String,
          default: "",
        },
        restaurant_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Restaurant",
          default: null,
        },
        restaurantInfo: {
          name: String,
          phone: String,
          address: String,
        },
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
        totalAmount: {
            type: Number,
            default: 0,
        },
        depositAmount: {
            type: Number,
            default: 0,
        },
        depositStatus: {
            type: String,
            default: "not_required",
        },
        tableInfo: {
            area: String,
            tableNumber: String,
            guestCount: Number,
            visitDate: String,
            arrivalTime: String,
            note: String
        },
        relativeContact: {
            fullName: String,
            phone: String,
            relationship: String,
        },
        bookingSlotKey: {
            type: String,
            default: "",
        },
        products: [
            {
                product_id: String,
                restaurant_id: String,
                name: String,
                img: String,
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
