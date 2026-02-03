const Account = require('../../models/account.model');
const Role = require('../../models/decentralization.model');

module.exports.requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }
    const user = await Account.findOne({ token, deleted: false }).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
    const role = await Role.findOne({ _id: user.role_id }).select('title permissions');
    // Lưu vào res.locals
    res.locals.user = user;
    res.locals.role = role;
    next(); // Cho phép đi tiếp tới controller/route
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ message: "Lỗi xác thực" });
  }
};