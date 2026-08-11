const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema(
    {
        user_id: {
            type: String,
            required: true,
            unique: true
        },
        keywords: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const searchHistory = mongoose.model('searchHistory', searchHistorySchema, 'search-histories');

module.exports = searchHistory;
