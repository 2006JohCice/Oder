const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      default: "",
    },
    area: {
      type: String,
      default: "",
    },
    note: {
      type: String,
      default: "",
    },
    restaurant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
    },
    capacity: {
      type: Number,
      default: 4,
    },
    status: {
      type: String,
      enum: ["available", "occupied"],
      default: "available",
    },
    currentOrderId: {
      type: String,
      default: "",
    },
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
    shape: {
      type: String,
      enum: ["round", "rect-small", "rect-large"],
      default: "round",
    },
  },
  {
    timestamps: true,
  }
);

tableSchema.index({ restaurant_id: 1, tableNumber: 1 }, { unique: true });

const Table = mongoose.model("Table", tableSchema, "tables");

module.exports = Table;
