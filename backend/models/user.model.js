const mongoose = require('mongoose');
const generate = require('../helpers/generate')
const userSchema = new mongoose.Schema(
    {

    fullname: String,
    email:String,
    password: {
        type: String,
        select: false,
    },
    points: {
      type: Number,
      default: 0
    },
    role: {
      type: String,
      enum: ["user", "owner", "staff", "admin"],
      default: "user",
    },
    restaurant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
    },
    tokenUser:{
        type:String,
        default: () => generate.generateRandomString(20),
        select: false,
    },
    phone:String,
    avatar:String,
    status:{
        type:String,
        default:"active",
    },
    deleted:{
        type:Boolean,
        default:false,
    },
    deleteAt: Date,

    },{
        timestamps: true
    });

const userAccount = mongoose.model('userAccount', userSchema , "userAccounts")

module.exports = userAccount;