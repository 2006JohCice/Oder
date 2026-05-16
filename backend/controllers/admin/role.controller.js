const Role = require("../../models/decentralization.model");

module.exports.index = async (req, res) => {
  try {
    const records = await Role.find({ deleted: false }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách vai trò" });
  }
};

module.exports.create = async (req, res) => {
  try {
    const data = await Role.find({ deleted: false }).sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy vai trò" });
  }
};

module.exports.createPost = async (req, res) => {
  try {
    const newRole = new Role({
      name: req.body.name,
      description: req.body.description,
    });
    await newRole.save();
    res.json({
      message: "Tạo vai trò thành công",
      role: newRole,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo vai trò" });
  }
};

module.exports.edit = async (req, res) => {
  try {
    const roleData = await Role.findOne({ _id: req.params.id, deleted: false });
    if (!roleData) {
      return res.status(404).json({ message: "Vai trò không tồn tại" });
    }
    res.json(roleData);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy vai trò" });
  }
};

module.exports.editPatch = async (req, res) => {
  try {
    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
      },
      { new: true }
    );
    if (!updatedRole) {
      return res.status(404).json({ message: "Vai trò không tồn tại" });
    }
    res.json({
      message: "Cập nhật vai trò thành công",
      role: updatedRole,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật vai trò" });
  }
};

module.exports.delete = async (req, res) => {
  try {
    const deletedRole = await Role.findByIdAndUpdate(
      req.params.id,
      { deleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!deletedRole) {
      return res.status(404).json({ message: "Vai trò không tồn tại" });
    }
    res.json({
      message: "Xóa vai trò thành công",
      role: deletedRole,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa vai trò" });
  }
};

module.exports.permissions = async (req, res) => {
  try {
    const data = await Role.find({ deleted: false }).sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy quyền" });
  }
};

module.exports.missionsPatch = async (req, res) => {
  const permissionsData = req.body;
  try {
    for (const item of permissionsData) {
      await Role.updateOne(
        { _id: item.roleId },
        { permissions: item.permissions }
      );
    }
    res.json({ message: "Cập nhật quyền thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật quyền" });
  }
};
