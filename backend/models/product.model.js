

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
  soldCount: {
    type: Number,
    default: 0
  },
  deleted: {
    type: Boolean,
    default: false
  },
  slug: { type: String, slug: "name", unique: true },
  description: String,
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    default: null,
  },
  deletedAt: Date,
  position: Number
},
  {
    timestamps: true
  });

productSchema.index({ restaurant_id: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ deleted: 1 });

const Product = mongoose.model('Product', productSchema, 'products');

module.exports = Product;

