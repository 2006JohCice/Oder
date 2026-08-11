const Policy = require("../../models/policy.model");

// [GET] /api/admin/policies
module.exports.getPolicies = async (req, res) => {
  try {
    const policies = await Policy.find({}).sort({ createdAt: -1 });
    res.json(policies);
  } catch (error) {
    console.error("Lỗi lấy danh sách policy:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// [POST] /api/admin/policies
module.exports.createPolicy = async (req, res) => {
  try {
    const { title, slug, content, isActive } = req.body;

    const exist = await Policy.findOne({ slug });
    if (exist) {
      return res.status(400).json({ message: "Slug đã tồn tại. Vui lòng chọn slug khác!" });
    }

    const newPolicy = new Policy({
      title,
      slug,
      content,
      isActive: isActive !== undefined ? isActive : true,
    });

    await newPolicy.save();
    res.json({ success: true, message: "Thêm thành công!", policy: newPolicy });
  } catch (error) {
    console.error("Lỗi thêm policy:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// [PUT] /api/admin/policies/:id
module.exports.updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, isActive } = req.body;

    const exist = await Policy.findOne({ slug, _id: { $ne: id } });
    if (exist) {
      return res.status(400).json({ message: "Slug đã tồn tại ở bài khác!" });
    }

    const updated = await Policy.findByIdAndUpdate(
      id,
      { title, slug, content, isActive },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy chính sách" });
    }

    res.json({ success: true, message: "Cập nhật thành công!", policy: updated });
  } catch (error) {
    console.error("Lỗi cập nhật policy:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// [DELETE] /api/admin/policies/:id
module.exports.deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    await Policy.findByIdAndDelete(id);
    res.json({ success: true, message: "Xóa thành công!" });
  } catch (error) {
    console.error("Lỗi xóa policy:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};
