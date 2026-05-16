const md5 = require("md5");
const Account = require("../../models/account.model");

module.exports.profile = async (req, res) => {
  const token = req.cookies.token;
  const userProfileAdmin = await Account.findOne({ token, deleted: false });

  return res.status(200).json({
    data: userProfileAdmin,
  });
};

module.exports.editProfile = async (req, res) => {
  const token = req.cookies.token;
  const { fullname, email, phone, oldPassword, newPassword, confirmPassword } = req.body;
  const userProfileAdmin = await Account.findOne({ token, deleted: false });

  if (!userProfileAdmin) {
    return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản" });
  }

  if (fullname) userProfileAdmin.fullname = fullname;
  if (email) userProfileAdmin.email = email;
  if (phone) userProfileAdmin.phone = phone;

  if (oldPassword || newPassword || confirmPassword) {
    if (md5(oldPassword || "") !== userProfileAdmin.password) {
      return res.status(400).json({ success: false, message: "Mật khẩu cũ không đúng" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Mật khẩu mới và xác nhận mật khẩu không khớp" });
    }
    userProfileAdmin.password = md5(newPassword);
  }

  await userProfileAdmin.save();
  return res.status(200).json({ success: true, message: "Cập nhật hồ sơ thành công" });
};
