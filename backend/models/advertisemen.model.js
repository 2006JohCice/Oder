const mongoose = require('mongoose');

const bannerItemSchema = new mongoose.Schema({
    image: { type: String, required: true },
    title: { type: String, default: "" },
    desc: { type: String, default: "" },
    badge: { type: String, default: "" },
    link: { type: String, default: "" }
}, { _id: false });

const advertisementSchema = new mongoose.Schema(
    {
        ads1: {
            position: { type: String, default: "LEFT" },
            size: { type: String, default: "1960x1200" },
            items: {
                type: [bannerItemSchema],
                validate: [arr => arr.length <= 7, "Tối đa 7 ảnh quảng cáo"],
                default: []
            }
        },
        ads2: {
            position: { type: String, default: "RIGHT_TOP" },
            size: { type: String, default: "800x200" },
            items: {
                type: [bannerItemSchema],
                default: []
            }
        },
        ads3: {
            position: { type: String, default: "RIGHT_BOTTOM" },
            size: { type: String, default: "800x200" },
            items: {
                type: [bannerItemSchema],
                default: []
            }
        }
    },
    {
        timestamps: true
    }
);

const advertisement = mongoose.model('advertisement', advertisementSchema, 'advertisements');

module.exports = advertisement;