const Product = require("../../models/product.model")

// [GET] /search
module.exports.index = async (req,res) =>{
    const keyword = req.query.keyword;
    console.log("ở đây",keyword)
    if(keyword){
        const keywordRegex = new RegExp(keyword,"i");
        const products = await Product.find({
            name:keywordRegex,
            status:"active",
            deleted:false
        })

        res.json(products);

    } 
   

}