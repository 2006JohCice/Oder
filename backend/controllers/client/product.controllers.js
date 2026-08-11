const Product = require("../../models/product.model");
const ProductCategory = require("../../models/controllerCategory.model");
const Restaurant = require("../../models/restaurant.model");

const decorateProducts = async (products = []) => {
  const restaurantIds = [...new Set(products.map((item) => String(item.restaurant_id || "")).filter(Boolean))];
  const restaurants = await Restaurant.find({ _id: { $in: restaurantIds } })
    .select("name slug ratingAverage ratingCount orderCount openTime closeTime")
    .lean();

  const restaurantMap = new Map(restaurants.map((item) => [String(item._id), item]));
  return products.map((product) => ({
    ...product.toObject ? product.toObject() : product,
    restaurantInfo: restaurantMap.get(String(product.restaurant_id || "")) || null,
  }));
};

module.exports.index = async (req, res) => {
  try {
    const data = await Product.find({
      status: "active",
      deleted: false,
    }).sort({ soldCount: -1, position: "desc" });

    const decorated = await decorateProducts(data);
    res.json(decorated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Loi khi lay du lieu" });
  }
};

module.exports.featuredProducts = async (req, res) => {
  try {
    const activeRestaurants = await Restaurant.find({ deleted: false, status: "active" })
      .sort({ ratingAverage: -1, orderCount: -1, createdAt: -1 })
      .select("_id");

    const topRestaurantIds = activeRestaurants.slice(0, 8).map((item) => item._id);

    const featuredRaw = await Product.find({
      deleted: false,
      status: "active",
      $or: [{ featured: "1" }, { restaurant_id: { $in: topRestaurantIds } }],
    })
      .sort({ soldCount: -1, position: "desc" })
      .limit(14);

    const latestRaw = await Product.find({
      deleted: false,
      status: "active",
    })
      .sort({ createdAt: -1, position: "desc" })
      .limit(7);

    const highlightedRestaurants = await Restaurant.find({
      deleted: false,
      status: "active",
    })
      .sort({ ratingAverage: -1, orderCount: -1, createdAt: -1 })
      .limit(6);

    const [data, dataProductsNew] = await Promise.all([
      decorateProducts(featuredRaw),
      decorateProducts(latestRaw),
    ]);

    res.json({
      data,
      dataProductsNew,
      highlightedRestaurants,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Loi khi lay du lieu" });
  }
};

module.exports.categoryProducts = async (req, res) => {
  try {
    const category = await ProductCategory.findOne({
      slug: req.params.slugCategory,
      deleted: false,
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const getSubCategory = async (parentId) => {
      const subs = await ProductCategory.find({
        father_id: parentId,
        status: "active",
        deleted: false,
      });

      let allSub = [...subs];

      for (const sub of subs) {
        const childs = await getSubCategory(sub._id);
        allSub = allSub.concat(childs);
      }

      return allSub;
    };

    const listSubCategory = await getSubCategory(category.id);
    const listSubCategoryID = listSubCategory.map((item) => item.id);

    const products = await Product.find({
      category: { $in: [category.id, ...listSubCategoryID] },
      deleted: false,
    });

    res.json(await decorateProducts(products));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports.detailProducts = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slugProduct,
      deleted: false,
      status: "active",
    });

    if (!product) {
      return res.status(404).json({ message: "Khong tim thay san pham" });
    }

    const [decorated] = await decorateProducts([product]);
    res.json(decorated);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};
