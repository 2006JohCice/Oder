const Product = require("../../models/product.model")
const ProductCategory = require("../../models/controllerCategory.model");
const { ObjectId } = require("mongodb");



//[GET] /api/products

module.exports.index = async (req, res) => {
  try {
    const data = await Product
      .find({
        status: "active",
        deleted: false
      })
      .sort({ position: "desc" });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu' });
  }
}

//[GET] /api/products/ (Featured - productsNew)
module.exports.featuredProducts = async (req, res) => {
  let find = {
    deleted: false,
    featured: "1",
    status: "active"
  }
  let findProductsNew = {
    deleted: false,
    status: "active"

  }
  try {
    const data = await Product.find(find).limit(14)
    const dataProductsNew = await Product.find(findProductsNew).sort({ position: "desc" }).limit(7)
    res.json({
      data,
      dataProductsNew
    });
    // console.log(data)
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu' });
  }
}

// [GET] /api/products/:slugCategory
module.exports.categoryProducts = async (req, res) => {
  try {
    const category = await ProductCategory.findOne({
      slug: req.params.slugCategory,
      deleted: false
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    const getSubCategory = async (parentId) => {
      const subs = await ProductCategory.find({
        father_id: parentId,
        status: "active",
        deleted: false,
      });

      let allSub = [...subs];

      // console.log(allSub);

      for (const sub of subs) {
        const childs = await getSubCategory(sub._id);
        allSub = allSub.concat(childs);
      }

      return allSub;
    };

    const listSubCategory = await getSubCategory(category.id)
    const listSubCategoryID = listSubCategory.map(item => item.id)


    // 693420b723be2adcf44ae277
    const products = await Product.find({
      category: { $in: [category.id, ...listSubCategoryID] },
      deleted: false
    });

    res.json(products);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};


// [GET] /api/products/detail/:slugProduct
module.exports.detailProducts = async (req, res) => {
  console.log(req.params.slugProduct)
  try {
    let find = {
      slug: req.params.slugProduct,
      deleted: false,
      status: "active"
    }
    const product = await Product.findOne(find);
     res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};
