const mongoose = require('mongoose');
const generate = require('../helpers/generate')
const userSchema = new mongoose.Schema(
    {

    fullname: String,
    email:String,
    password:String,
    tokenUser:{
        type:String,
        default:generate.generateRandomString(20),
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