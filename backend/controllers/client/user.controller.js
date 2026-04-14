const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgot-password.model");
const generateHelper = require("../../helpers/generate");
const sendMailHelper = require("../../helpers/sendMail");
const md5 = require("md5");
// [GET]  api/user
module.exports.getUser = async (req, res) => {
  const users = await User.find({ deleted: false }).select(
    "-password -tokenUser"
  );
  return res.status(200).json({ users });
};
//Create OTP For Register
//[POST] api/user/register/passwordOtp
module.exports.passwordRegisterOtp =async (req, res) =>{
  console.log("Password Register OTP:", req.body);
   if (
    !req.body ||
    !req.body.fullName ||
    !req.body.email ||
    !req.body.password ||
    !req.body.confirmPassword
  ) {
    return res.status(400).json({ message: "Nhập Thông Tin Đầy Đủ" });
  }
  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({ messagePassword: "Mật Khẩu Không Khớp" });
  }
 


  const existEmail = await User.find({
    email: req.body.email,
    deleted: false,
  });

  if (existEmail.length > 0) {
    return res.status(400).json({ message: "Email đã tồn tại" });
  }
  const otpRamdon = generateHelper.generateRandomNumber(6);
  
  const objectForgotPassword = {
    email: req.body.email,
    otp: otpRamdon,
    type: "register",
    expireAt: Date.now(),
  };
  console.log(objectForgotPassword)
  // console.log("Forgot Password Object:", otpRamdon);
  const forgotPassword = new ForgotPassword(objectForgotPassword);
  await forgotPassword.save();
  const subject = "Yêu Tạo Tài Khoản Mới Với Order Local ";
  const html = `Mã OTP của bạn là: <b>${otpRamdon}</b>. Mã OTP này sẽ hết hạn sau 1 phút. Nếu bạn không yêu cầu tạo tài khoản, vui lòng bỏ qua email này.`;
  sendMailHelper.sendMail( req.body.email, subject, html);
}
// [POST] api/user/register
module.exports.register = async (req, res) => {
  console.log("Register user:", req.body);
  if (
    !req.body ||
    !req.body.fullName ||
    !req.body.email ||
    !req.body.password ||
    !req.body.confirmPassword ||
    !req.body.otp
  ) {
    return res.status(400).json({ message: "Nhập Thông Tin Đầy Đủ" });
  }
  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({ messagePassword: "Mật Khẩu Không Khớp" });
  }

  const existEmail = await User.find({
    email: req.body.email,
    deleted: false,
  });

  if (existEmail.length > 0) {
    return res.status(400).json({ message: "Email đã tồn tại" });
  }
 
  const userRegister = await ForgotPassword.findOne({
    email:  req.body.email,
    otp: req.body.otp,
    type: "register",
  });
  if (!userRegister) {
    return res.status(400).json({
      message: "Xác Thực Không Thành Công Kiểm Tra Lại Email Hoặc OTP",
    });
  } else {
    req.body.password = md5(req.body.password);

    const user = new User(req.body);
    await user.save();
    res.cookie("tokenUser", user.tokenUser, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    console.log(user);
    return res.status(201).json({ message: "Đăng ký thành công" });
  }
};

// [POST] api/user/login
module.exports.login = async (req, res) => {
  console.log("Login user:", req.body);
  if (!req.body || !req.body.email || !req.body.password) {
    return res.status(400).json({ message: "Nhập Thông Tin Đầy Đủ" });
  }

  const user = await User.findOne({
    email: req.body.email,
    password: md5(req.body.password),
    deleted: false,
  });

  if (!user) {
    return res.status(400).json({ message: "Email hoặc Mật Khẩu Không Đúng" });
  }

  if (user.status !== "active") {
    return res
      .status(400)
      .json({ alerts: "Tài khoản của bạn không còn hoạt động" });
  }
  res.cookie("tokenUser", user.tokenUser, {
    httpOnly: true,
    secure: false,        // dev localhost
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  console.log(user);
  return res.status(200).json({ message: "Đăng nhập thành công" });
};
// [GET] api/user/logout
module.exports.logout = async (req, res) => {
  res.clearCookie("tokenUser");
  return res.status(200).json({ message: "Đăng xuất thành công" });
};
// Create OTP For Forgot Password
//[POST] /api/user/password/forgot
module.exports.forgotPassword = async (req, res) => {
  const { email, password, confirmPassword, otp } = req.body;
  if (!email || !confirmPassword || !password) {
    return res.status(400).json({ message: "Nhập Thông Tin Đầy Đủ" });
  }
  if (password != confirmPassword) {
    return res.status(400).json({ messagePassword: "Mật Khẩu Không Khớp" });
  }
  const user = await User.findOne({
    email: email,
    deleted: false,
  });
  // console.log(user)
  if (!user) {
    return res.status(400).json({
      alerts: "Tài Khoản Email Không Tồn Tại",
    });
  }
  const otpRamdon = generateHelper.generateRandomNumber(6);
  const objectForgotPassword = {
    email: email,
    otp: otpRamdon,
    expireAt: Date.now(),
  };

  // console.log(objectForgotPassword)
  const forgotPassword = new ForgotPassword(objectForgotPassword);
  await forgotPassword.save();
  const subject = "Yêu Cầu Đặt Lại Mật Khẩu";
  const html = `Mã OTP của bạn là: <b>${otpRamdon}</b>. Mã OTP này sẽ hết hạn sau 1 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.`;
  sendMailHelper.sendMail(email, subject, html);
};

//[POST] /user/password/otp
module.exports.otpPasswordPost = async (req, res) => {
  const { email, password, confirmPassword, otp } = req.body;
  if (!email || !confirmPassword || !password || !otp) {
    return res.status(400).json({ message: "Nhập Thông Tin Đầy Đủ" });
  }
  if (password != confirmPassword) {
    return res.status(400).json({ messagePassword: "Mật Khẩu Không Khớp" });
  }
  const user = await ForgotPassword.findOne({
    email: email,
    otp: otp,
  });
  // console.log(user)
  if (!user) {
    return res.status(400).json({
      alerts: "Xác Thực Không Thành Công Kiểm Tra Lại Email, Mật Khẩu Hoặc OTP",
    });
  } else {
    const users = await User.updateOne(
      {
        email: email,
      },
      {
        password: md5(password),
      }
    );
    // res.cookie("tokenUser", user.tokenUser);

    return res.status(200).json({});
  }
  console.log(user);
};

//[GET] /api/user/me
module.exports.infoUser = async (req, res) => {
  if (res.locals.user) {
    res.json({ user: res.locals.user });
  } else {
    res.status(401).json({ message: "Chưa đăng nhập" });
  }
  console.log(res.locals.user);
};
