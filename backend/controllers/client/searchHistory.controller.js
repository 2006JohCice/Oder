const SearchHistory = require('../../models/searchHistory.model');

module.exports.getHistory = async (req, res) => {
    try {
        const user = res.locals.user;
        if (!user) return res.status(401).json({ message: "Unauthorized" });
        
        const history = await SearchHistory.findOne({ user_id: user.id });
        if (!history) return res.status(200).json([]);
        
        res.status(200).json(history.keywords);
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};

module.exports.addHistory = async (req, res) => {
    try {
        const user = res.locals.user;
        if (!user) return res.status(401).json({ message: "Unauthorized" });

        const { keyword } = req.body;
        if (!keyword || !keyword.trim()) return res.status(400).json({ message: "Keyword is required" });

        const formattedKeyword = keyword.trim();

        let history = await SearchHistory.findOne({ user_id: user.id });
        
        if (!history) {
            history = new SearchHistory({
                user_id: user.id,
                keywords: [formattedKeyword]
            });
        } else {
            history.keywords = history.keywords.filter(k => k.toLowerCase() !== formattedKeyword.toLowerCase());
            history.keywords.unshift(formattedKeyword);
            if (history.keywords.length > 10) history.keywords = history.keywords.slice(0, 10);
        }

        await history.save();
        res.status(200).json(history.keywords);
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};
