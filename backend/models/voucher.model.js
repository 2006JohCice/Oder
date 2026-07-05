const { mongoose } = require('../config/database');

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    discountType: {
      type: String,
      enum: ['amount', 'percent'],
      default: 'amount',
    },
    discountValue: {
      type: Number,
      required: true,
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: 0, // Only applicable for percent type
    },
    description: {
      type: String,
      default: '',
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    restaurant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
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

voucherSchema.index({ restaurant_id: 1 });
voucherSchema.index({ code: 1 });

const Voucher = mongoose.model('Voucher', voucherSchema, 'vouchers');

module.exports = Voucher;
