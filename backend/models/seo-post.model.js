const mongoose = require("mongoose");

const seoPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    isAdvertisement: {
      type: Boolean,
      default: false,
    },
    adImage: {
      type: String,
      default: "",
    },
    metaTitle: {
      type: String,
      default: "",
    },
    metaDescription: {
      type: String,
      default: "",
    },
    metaKeywords: {
      type: String,
      default: "",
    },
    author: {
      type: String,
      default: "Admin",
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    views: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

seoPostSchema.index({ slug: 1 });
seoPostSchema.index({ status: 1 });

const SeoPost = mongoose.model("SeoPost", seoPostSchema, "seo_posts");
module.exports = SeoPost;
