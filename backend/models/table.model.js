const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: true,
      unique: true
    },
    area: {
      type: String,
      default: ""
    },
    capacity: {
      type: Number,
      default: 4
    },
    status: {
      type: String,
      enum: ["available", "occupied"],
      default: "available"
    },
    currentOrderId: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Table = mongoose.model("Table", tableSchema, "tables");

module.exports = Table;
