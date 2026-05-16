const { mongoose } = require("../config/database");

const restaurantFeedbackSchema = new mongoose.Schema(
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
      default: "good",
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RestaurantFeedback", restaurantFeedbackSchema, "restaurantFeedbacks");
