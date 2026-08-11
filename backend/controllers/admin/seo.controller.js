const SeoPost = require("../../models/seo-post.model");

// [GET] /api/admin/seo
module.exports.index = async (req, res) => {
  try {
    const posts = await SeoPost.find({}).sort({ createdAt: -1 });
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// [POST] /api/admin/seo/create
module.exports.create = async (req, res) => {
  try {
    const post = new SeoPost(req.body);
    await post.save();
    res.status(201).json({ message: "Tạo bài viết thành công", post });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Đường dẫn (slug) đã tồn tại!" });
    }
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// [GET] /api/admin/seo/:id
module.exports.detail = async (req, res) => {
  try {
    const post = await SeoPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Không tìm thấy" });
    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// [PATCH] /api/admin/seo/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const post = await SeoPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Cập nhật thành công", post });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Đường dẫn (slug) đã tồn tại!" });
    }
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// [DELETE] /api/admin/seo/delete/:id
module.exports.delete = async (req, res) => {
  try {
    await SeoPost.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
};
