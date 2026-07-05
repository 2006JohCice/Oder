

const mongoose = require('mongoose');
const generate = require('../helpers/generate')
const accountSchema = new mongoose.Schema(
    {

    fullname: String,
    email:String,
    password: {
        type: String,
        select: false,
    },
    token:{
        type:String,
        default:generate.generateRandomString(20),
        select: false,
    },
    phone:String,
    avatar:String,
    role_id: String,
    status:String,
    deleted:{
        type:Boolean,
        default:false,
    },
    deleteAt: Date,

    },{
        timestamps: true
    });

const Account = mongoose.model('Acount', accountSchema, 'accounts');

module.exports = Account;

