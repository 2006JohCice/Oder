

// const mongoose = require('mongoose');
// Dùng mongoose từ file database.js để đảm bảo cùng kết nối
const { mongoose } = require('../config/database');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug)
const productSchema = new mongoose.Schema({
  
  name: String,
  price: Number,
  img: String,
  stock: Number,
  category: String,
  status: { type: String, default: "active" },
  featured:String,
  deleted: {
    type: Boolean,
    default: false
  },
  slug: { type: String, slug: "name", unique: true },
  description: String,

  deletedAt: Date,
  position: Number
},
  {
    timestamps: true
  });

const Product = mongoose.model('Product', productSchema, 'products');

module.exports = Product;

