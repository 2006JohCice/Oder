const md5 = require("md5");
const Account = require("../../models/account.model");
const Role = require("../../models/decentralization.model");
const mongoose = require("mongoose");

module.exports.index = async (req, res) => {
  try {
    const records = await Account.find({ deleted: false }).lean();

    for (const record of records) {
      if (mongoose.Types.ObjectId.isValid(record.role_id)) {
        record.role = await Role.findOne({
          _id: record.role_id,
          deleted: false,
        }).lean();
      }
    }

    res.json({
      records,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu" });
  }
};

module.exports.getCreate = async (req, res) => {
  const data = await Role.find({ deleted: false });
  try {
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi khi lấy vai trò" });
  }
};

module.exports.create = async (req, res) => {
  const emailExist = await Account.findOne({
    email: req.body.email,
    deleted: false,
  });

  if (emailExist) {
    return res.status(400).json({
      message: "Email đã tồn tại",
    });
  }

  req.body.password = md5(req.body.password);
  const record = new Account(req.body);
  await record.save();

  return res.status(201).json({
    message: "Tạo tài khoản thành công",
  });
};

module.exports.edit = async (req, res) => {
  const id = req.params.id;
  const { fullname, email, phone, role_id, status, password } = req.body;

  try {
    const updatedData = { fullname, email, phone, role_id, status };
    if (password) {
      updatedData.password = md5(password);
    }

    await Account.updateOne({ _id: id }, { $set: updatedData });
    return res.status(200).json({ success: true, message: "Cập nhật tài khoản thành công" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi cập nhật tài khoản" });
  }
};
