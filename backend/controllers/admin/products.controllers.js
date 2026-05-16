const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const Product = require("../../models/product.model");
const ProductCategory = require("../../models/controllerCategory.model");
const Restaurant = require("../../models/restaurant.model");

const buildRestaurantMap = async (products = []) => {
  const restaurantIds = [...new Set(products.map((item) => String(item.restaurant_id || "")).filter(Boolean))];
  const restaurants = await Restaurant.find({ _id: { $in: restaurantIds } })
    .select("name ratingAverage ratingCount orderCount")
    .lean();
  return new Map(restaurants.map((item) => [String(item._id), item]));
};

module.exports.index = async (req, res) => {
  const final = {
    deleted: false,
  };

  if (req.query.status) {
    final.status = req.query.status;
  }

  const objSearch = searchHelper(req.query);
  if (objSearch.regex) {
    final.name = objSearch.regex;
  }

  if (req.query.category) {
    final.category = req.query.category;
  }

  if (req.query.restaurantId) {
    final.restaurant_id = req.query.restaurantId;
  }

  const countProducts = await Product.countDocuments(final);
  const objPagination = paginationHelper(
    {
      pagePage: 1,
      limitItems: 10,
    },
    req.query,
    countProducts
  );

  const sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    sort.position = "desc";
  }

  try {
    const data = await Product.find(final)
      .sort(sort)
      .limit(objPagination.limitItems)
      .skip(objPagination.skip)
      .lean();

    const restaurantMap = await buildRestaurantMap(data);
    const products = data.map((item) => ({
      ...item,
      restaurantInfo: restaurantMap.get(String(item.restaurant_id || "")) || null,
    }));

    const restaurants = await Restaurant.find({ deleted: false, status: "active" })
      .select("name ratingAverage ratingCount orderCount")
      .sort({ ratingAverage: -1, orderCount: -1 })
      .lean();

    res.json({
      data: products,
      objPagination,
      restaurants,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Loi khi lay du lieu" });
  }
};

module.exports.changeStatus = async (req, res) => {
  try {
    const status = req.params.status;
    const id = req.params.id;

    const result = await Product.updateOne({ _id: id }, { status });
    res.json({
      success: true,
      message: `Da cap nhat san pham ${id} sang trang thai ${status}`,
      result,
    });
  } catch (error) {
    console.error("Loi khi cap nhat:", error);
    res.status(500).json({ success: false, message: "Cap nhat that bai" });
  }
};

module.exports.changeMulti = async (req, res) => {
  try {
    const { ids, idPosition, newStatus } = req.body;

    if (!ids?.length || !newStatus) {
      return res.status(400).json({ message: "Thieu du lieu" });
    }

    switch (newStatus) {
      case "active":
        await Product.updateMany({ _id: { $in: ids } }, { $set: { status: "active" } });
        break;
      case "inactive":
        await Product.updateMany({ _id: { $in: ids } }, { $set: { status: "inactive" } });
        break;
      case "delete-all":
        await Product.updateMany(
          { _id: { $in: ids } },
          {
            deleted: true,
            deletedAt: new Date(),
          }
        );
        break;
      case "change-position":
        for (const item of idPosition || []) {
          await Product.updateOne({ _id: item.id }, { $set: { position: item.position } });
        }
        break;
      default:
        return res.status(400).json({ message: "Trang thai khong hop le" });
    }

    return res.json({
      message: `Da cap nhat san pham sang '${newStatus}'`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Loi server" });
  }
};

module.exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.updateOne({ _id: id }, { deleted: true, deletedAt: new Date() });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Khong tim thay san pham de xoa",
      });
    }

    res.json({
      success: true,
      message: "Xoa san pham thanh cong",
    });
  } catch (error) {
    console.error("Loi khi xoa san pham:", error);
    res.status(500).json({
      success: false,
      message: "Loi may chu khi xoa san pham",
    });
  }
};

module.exports.createGet = async (req, res) => {
  const final = {
    deleted: false,
  };

  function createTree(data, parentId = "") {
    const tree = [];

    data.forEach((item) => {
      if (item.father_id === String(parentId)) {
        const newItem = item;
        const children = createTree(data, String(item._id));

        if (children.length > 0) {
          newItem.children = children;
        }

        tree.push(newItem);
      }
    });

    return tree;
  }

  try {
    const category = await ProductCategory.find(final).lean();
    const restaurants = await Restaurant.find({ deleted: false, status: "active" }).select("name");
    const newCategory = createTree(category);
    res.json({
      categories: newCategory,
      restaurants,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Loi khi lay du lieu" });
  }
};

module.exports.create = async (req, res) => {
  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage || 0);
  req.body.stock = parseInt(req.body.stock || 0);

  if (!req.body.position) {
    const count = await Product.countDocuments();
    req.body.position = count + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }

  const product = new Product(req.body);
  await product.save();

  res.json({
    message: "Tao san pham thanh cong",
    product,
  });
};

module.exports.edit = async (req, res) => {
  const find = {
    deleted: false,
    _id: req.params.id,
  };
  const product = await Product.findOne(find);

  res.json({
    product,
  });
};

module.exports.editPatch = async (req, res) => {
  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage || 0);
  req.body.stock = parseInt(req.body.stock || 0);
  req.body.position = parseInt(req.body.position);

  try {
    await Product.updateOne({ _id: req.params.id }, req.body);
    res.json({
      message: "Cap nhat san pham thanh cong",
    });
  } catch (error) {
    console.error("Loi khi cap nhat san pham:", error);
    res.status(500).json({
      message: "Loi may chu khi cap nhat san pham",
    });
  }
};
