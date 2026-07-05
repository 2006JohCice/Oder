const { mongoose } = require('../config/database');
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
    description: {
      type: String,
      default: '',
    },
    openTime: {
      type: String,
      default: '08:00',
    },
    closeTime: {
      type: String,
      default: '22:00',
    },
    locationLabel: {
      type: String,
      default: '',
    },
    location: {
      lat: { type: Number, default: 21.028511 }, // Default to Hanoi
      lng: { type: Number, default: 105.804817 },
    },
    tableCount: {
      type: Number,
      default: 0,
    },
    ratingAverage: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    orderCount: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
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
