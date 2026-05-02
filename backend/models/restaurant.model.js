const { mongoose } = require('../config/database');
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      slug: 'name',
      unique: true,
    },
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'userAccount',
      required: true,
    },
    phone: String,
    address: String,
    status: {
      type: String,
      enum: ['active', 'inactive','pending'],
      default: 'pending',
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

const Restaurant = mongoose.model('Restaurant', restaurantSchema, 'restaurants');

module.exports = Restaurant;
