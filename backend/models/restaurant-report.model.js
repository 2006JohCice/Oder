const { mongoose } = require("../config/database");

const restaurantReportSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    restaurant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    fullname: String,
    email: String,
    restaurant: String,
    sentiment: {
      type: String,
      enum: ["good", "bad", "neutral"],
      default: "bad",
    },
    report: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RestaurantReport", restaurantReportSchema, "restaurantReports");
