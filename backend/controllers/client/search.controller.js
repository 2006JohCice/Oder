const Product = require("../../models/product.model")

// [GET] /search
module.exports.index = async (req,res) =>{
    const keyword = req.query.keyword;
    console.log("ở đây",keyword)
    let query = {
        status: "active",
        deleted: false
    };

    if (keyword) {
        const keywordRegex = new RegExp(keyword, "i");
        query.name = keywordRegex;
    }

    try {
        const products = await Product.find(query);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Lỗi tìm kiếm" });
    }

}