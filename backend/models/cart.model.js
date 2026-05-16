const mongoose = require('mongoose');


const cartSchema = new mongoose.Schema(
    {
        user_id:String,
        restaurant_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Restaurant",
          default: null,
        },
        restaurant_ids: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Restaurant",
            }
        ],
        products:[
            {
                product_id: String,
                quantity: Number
            }
        ]
    },
    {
        timestamps: true
    });

const Cart = mongoose.model('Cart', cartSchema, 'carts');

module.exports = Cart;

