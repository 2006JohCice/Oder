const mongoose = require('mongoose');
const advertisementSchema = new mongoose.Schema(
    {
        ads1: {
            position: { type: String, default: "LEFT" },
            size: { type: String, default: "1960x1200" },
            images: {
                type: [String],
                validate: [arr => arr.length <= 7, "Tối đa 7 ảnh quảng cáo"],
                default: []
            }
        },
        ads2: {
            position: { type: String, default: "RIGHT_TOP" },
            size: { type: String, default: "800x200" },
            images: {
                type: [String],
                default: []
            }
        },
        ads3: {
            position: { type: String, default: "RIGHT_BOTTOM" },
            size: { type: String, default: "800x200" },
            images: {
                type: [String],
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