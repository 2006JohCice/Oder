const bcrypt = require("bcryptjs");

const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgot-password.model");
const Restaurant = require("../../models/restaurant.model");
const RestaurantFeedback = require("../../models/restaurant-feedback.model");
const RestaurantReport = require("../../models/restaurant-report.model");

const generateHelper = require("../../helpers/generate");
const sendMailHelper = require("../../helpers/sendMail");



const passwordRegex =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



const escapeRegExp = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sendResponse = (
  res,
  status = 200,
  success = true,
  message = "",
  data = {}
) => {
  return res.status(status).json({
    success,
    message,
    ...data,
  });
};

const generateOtpEmailTemplate = (otp) => {
  return `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
    <meta charset="UTF-8" />
  </head>
  <body style="margin:0;padding:0;background-color:#1a1a1a;font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;">
      <tr>
        <td align="center" style="padding:40px 20px;">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#2a2a2a;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);border:1px solid #3a3a3a;">
            
            <!-- Header Section with Dark Red Theme -->
            <tr>
              <td style="background: linear-gradient(135deg, #8B0000 0%, #4A0000 100%);padding:40px 0;text-align:center;border-bottom:3px solid #D4AF37;">
                <h1 style="color:#ffffff;margin:0;font-size:28px;letter-spacing:2px;font-weight:600;text-transform:uppercase;">Gourmet Pulse</h1>
                <p style="color:#D4AF37;margin:10px 0 0 0;font-size:14px;letter-spacing:4px;text-transform:uppercase;">Xác Thực Tài Khoản</p>
              </td>
            </tr>

            <!-- Content Section -->
            <tr>
              <td style="padding:40px 40px;text-align:center;">
                <h2 style="color:#ffffff;margin:0 0 20px 0;font-size:22px;font-weight:400;">Kính chào Quý khách,</h2>
                <p style="color:#cccccc;line-height:1.6;font-size:15px;margin:0 0 30px 0;">
                  Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu cho tài khoản của Quý khách. Vui lòng sử dụng mã bảo mật dưới đây để tiếp tục quá trình xác thực.
                </p>

                <div style="margin:30px 0;">
                  <span style="display:inline-block;background-color:#111111;color:#D4AF37;font-size:36px;letter-spacing:8px;padding:20px 40px;border-radius:8px;font-weight:bold;border:1px solid #D4AF37;box-shadow:0 4px 15px rgba(212, 175, 55, 0.1);">
                    ${otp}
                  </span>
                </div>

                <p style="color:#999999;font-size:14px;margin:30px 0 0 0;">
                  Mã xác thực này sẽ hết hạn sau <b style="color:#D4AF37;">5 phút</b>.
                </p>
                <p style="color:#777777;font-size:13px;margin:15px 0 0 0;">
                  Vì lý do bảo mật, vui lòng <b style="color:#ffffff;">không chia sẻ</b> mã này với bất kỳ ai.<br/>
                  Nếu Quý khách không yêu cầu thao tác này, vui lòng bỏ qua email.
                </p>
              </td>
            </tr>

            <!-- Footer Section -->
            <tr>
              <td style="background-color:#222222;padding:25px;text-align:center;border-top:1px solid #333333;">
                <p style="margin:0;font-size:12px;color:#666666;letter-spacing:1px;">
                  © ${new Date().getFullYear()} GOURMET PULSE. ALL RIGHTS RESERVED.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

const validateRegister = ({
  fullName,
  email,
  password,
  confirmPassword,
}) => {
  if (!fullName || !email || !password || !confirmPassword) {
    return "Nhập đầy đủ thông tin";
  }

  if (!emailRegex.test(email)) {
    return "Email không hợp lệ";
  }

  if (password !== confirmPassword) {
    return "Mật khẩu không khớp";
  }

  if (!passwordRegex.test(password)) {
    return "Mật khẩu phải có ít nhất 6 ký tự, gồm 1 chữ hoa và 1 ký tự đặc biệt";
  }

  return null;
};

const findRestaurantByInput = async (restaurantInput) => {
  if (!restaurantInput) return null;

  const normalized = String(restaurantInput).trim();

  const orConditions = [
    {
      name: new RegExp(`^${escapeRegExp(normalized)}$`, "i"),
    },
  ];

  if (/^[0-9a-fA-F]{24}$/.test(normalized)) {
    orConditions.push({ _id: normalized });
  }

  return Restaurant.findOne({
    deleted: false,
    $or: orConditions,
  });
};

const recalculateRestaurantRating = async (restaurantId) => {
  const feedbacks = await RestaurantFeedback.find({
    restaurant_id: restaurantId,
  });

  const ratingCount = feedbacks.length;

  const ratingAverage = ratingCount
    ? feedbacks.reduce(
        (sum, item) => sum + Number(item.rating || 0),
        0
      ) / ratingCount
    : 0;

  await Restaurant.updateOne(
    { _id: restaurantId },
    {
      ratingAverage: Number(ratingAverage.toFixed(1)),
      ratingCount,
    }
  );
};

// ======================
// [GET] api/user
// ======================

module.exports.getUser = async (req, res) => {
  try {
    const users = await User.find({
      deleted: false,
    }).select("-password -tokenUser");

    return sendResponse(res, 200, true, "Lấy danh sách user thành công", {
      users,
    });
  } catch (error) {
    console.error(error);

    return sendResponse(res, 500, false, "Lỗi máy chủ");
  }
};

// ======================
// [POST] api/user/register/passwordOtp
// ======================

module.exports.passwordRegisterOtp = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      confirmPassword,
    } = req.body;

    const validateMessage = validateRegister({
      fullName,
      email,
      password,
      confirmPassword,
    });

    if (validateMessage) {
      return sendResponse(res, 400, false, validateMessage);
    }

    const existEmail = await User.findOne({
      email,
      deleted: false,
    });

    if (existEmail) {
      return sendResponse(res, 400, false, "Email đã tồn tại");
    }

    const otpRandom = generateHelper.generateRandomNumber(6);

    await ForgotPassword.create({
      email,
      otp: otpRandom,
      type: "register",
      expireAt: Date.now() + 5 * 60 * 1000,
    });

    const subject = "Yêu cầu tạo tài khoản mới";

    const html = generateOtpEmailTemplate(otpRandom);

    await sendMailHelper.sendMail(email, subject, html);

    return sendResponse(
      res,
      200,
      true,
      "Đã gửi OTP về email"
    );
  } catch (error) {
    console.error(error);

    return sendResponse(res, 500, false, "Lỗi máy chủ");
  }
};

// ======================
// [POST] api/user/register
// ======================

module.exports.register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      otp,
    } = req.body;

    const validateMessage = validateRegister({
      fullName,
      email,
      password,
      confirmPassword,
    });

    if (validateMessage) {
      return sendResponse(res, 400, false, validateMessage);
    }

    if (!otp) {
      return sendResponse(res, 400, false, "Vui lòng nhập OTP");
    }

    const existEmail = await User.findOne({
      email,
      deleted: false,
    });

    if (existEmail) {
      return sendResponse(res, 400, false, "Email đã tồn tại");
    }

    const userRegister = await ForgotPassword.findOne({
      email,
      otp,
      type: "register",
    });

    if (!userRegister) {
      return sendResponse(
        res,
        400,
        false,
        "OTP không hợp lệ hoặc đã hết hạn"
      );
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullname: fullName,
      email,
      password: hashPassword,
    });

    await user.save();

    res.cookie("tokenUser", user.tokenUser, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return sendResponse(
      res,
      201,
      true,
      "Đăng ký thành công"
    );
  } catch (error) {
    console.error(error);

    return sendResponse(res, 500, false, "Lỗi máy chủ");
  }
};

// ======================
// [POST] api/user/login
// ======================

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(
        res,
        400,
        false,
        "Nhập đầy đủ thông tin"
      );
    }

    const user = await User.findOne({
      email,
      deleted: false,
    }).select("+password +tokenUser");

    if (!user) {
      return sendResponse(
        res,
        400,
        false,
        "Email hoặc mật khẩu không đúng"
      );
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return sendResponse(
        res,
        400,
        false,
        "Email hoặc mật khẩu không đúng"
      );
    }

    if (user.status !== "active") {
      return sendResponse(
        res,
        400,
        false,
        "Tài khoản của bạn đã bị khóa"
      );
    }

    res.cookie("tokenUser", user.tokenUser, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return sendResponse(
      res,
      200,
      true,
      "Đăng nhập thành công"
    );
  } catch (error) {
    console.error(error);

    return sendResponse(res, 500, false, "Lỗi máy chủ");
  }
};

// ======================
// [GET] api/user/logout
// ======================

module.exports.logout = async (req, res) => {
  res.clearCookie("tokenUser");

  return sendResponse(
    res,
    200,
    true,
    "Đăng xuất thành công"
  );
};

// ======================
// [POST] api/user/password/forgot
// ======================

module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendResponse(
        res,
        400,
        false,
        "Vui lòng nhập email"
      );
    }

    const user = await User.findOne({
      email,
      deleted: false,
    });

    if (!user) {
      return sendResponse(
        res,
        400,
        false,
        "Email không tồn tại"
      );
    }

    const otpRandom = generateHelper.generateRandomNumber(6);

    await ForgotPassword.create({
      email,
      otp: otpRandom,
      type: "forgot",
      expireAt: Date.now() + 5 * 60 * 1000,
    });

    const subject = "Yêu cầu đặt lại mật khẩu";

    const html = generateOtpEmailTemplate(otpRandom);

    await sendMailHelper.sendMail(email, subject, html);

    return sendResponse(
      res,
      200,
      true,
      "Đã gửi OTP về email"
    );
  } catch (error) {
    console.error(error);

    return sendResponse(res, 500, false, "Lỗi máy chủ");
  }
};

// ======================
// [POST] /api/user/password/otp
// ======================

module.exports.otpPasswordPost = async (req, res) => {
  try {
    const {
      email,
      password,
      confirmPassword,
      otp,
    } = req.body;

    if (!email || !password || !confirmPassword || !otp) {
      return sendResponse(
        res,
        400,
        false,
        "Nhập đầy đủ thông tin"
      );
    }

    if (password !== confirmPassword) {
      return sendResponse(
        res,
        400,
        false,
        "Mật khẩu không khớp"
      );
    }

    const forgotPassword = await ForgotPassword.findOne({
      email,
      otp,
      type: "forgot",
    });

    if (!forgotPassword) {
      return sendResponse(
        res,
        400,
        false,
        "OTP không hợp lệ hoặc đã hết hạn"
      );
    }

    const hashPassword = await bcrypt.hash(password, 10);

    await User.updateOne(
      { email },
      {
        password: hashPassword,
      }
    );

    return sendResponse(
      res,
      200,
      true,
      "Đổi mật khẩu thành công"
    );
  } catch (error) {
    console.error(error);

    return sendResponse(res, 500, false, "Lỗi máy chủ");
  }
};

// ======================
// [GET] /api/user/me
// ======================

module.exports.infoUser = async (req, res) => {
  try {
    if (!res.locals.user) {
      return sendResponse(
        res,
        401,
        false,
        "Chưa đăng nhập"
      );
    }

    return sendResponse(
      res,
      200,
      true,
      "Lấy thông tin user thành công",
      {
        user: res.locals.user,
      }
    );
  } catch (error) {
    console.error(error);

    return sendResponse(res, 500, false, "Lỗi máy chủ");
  }
};

// ======================
// [PATCH] /api/user/profile
// ======================

module.exports.updateProfile = async (req, res) => {
  try {
    const currentUser = res.locals.user;

    if (!currentUser) {
      return sendResponse(
        res,
        401,
        false,
        "Chưa đăng nhập"
      );
    }

    const { fullName, phone, avatar } = req.body;

    const updateData = {};

    if (typeof fullName === "string") {
      updateData.fullName = fullName.trim();
    }

    if (typeof phone === "string") {
      updateData.phone = phone.trim();
    }

    if (typeof avatar === "string") {
      updateData.avatar = avatar.trim();
    }

    await User.updateOne(
      { _id: currentUser._id },
      updateData
    );

    const user = await User.findById(currentUser._id)
      .select("-password");

    return sendResponse(
      res,
      200,
      true,
      "Cập nhật thông tin thành công",
      {
        user,
      }
    );
  } catch (error) {
    console.error(error);

    return sendResponse(res, 500, false, "Lỗi máy chủ");
  }
};

// ======================
// FEEDBACK
// ======================

module.exports.submitFeedback = async (req, res) => {
  try {
    const currentUser = res.locals.user;

    if (!currentUser) {
      return sendResponse(
        res,
        401,
        false,
        "Chưa đăng nhập"
      );
    }

    const {
      fullname,
      email,
      restaurant,
      sentiment,
      feedback,
      rating,
    } = req.body;

    if (!feedback || !restaurant) {
      return sendResponse(
        res,
        400,
        false,
        "Vui lòng nhập nhà hàng và nội dung góp ý"
      );
    }

    const restaurantDoc =
      await findRestaurantByInput(restaurant);

    if (!restaurantDoc) {
      return sendResponse(
        res,
        404,
        false,
        "Không tìm thấy nhà hàng"
      );
    }

    const ratingValue = Number(
      rating || (sentiment === "bad" ? 2 : 5)
    );

    await RestaurantFeedback.create({
      user_id: currentUser._id,
      restaurant_id: restaurantDoc._id,
      fullname: fullname || currentUser.fullName || "",
      email: email || currentUser.email || "",
      restaurant: restaurantDoc.name,
      sentiment: sentiment || "good",
      rating: Math.max(1, Math.min(5, ratingValue)),
      feedback: String(feedback).trim(),
    });

    await recalculateRestaurantRating(
      restaurantDoc._id
    );

    return sendResponse(
      res,
      201,
      true,
      "Gửi góp ý thành công"
    );
  } catch (error) {
    console.error(error);

    return sendResponse(res, 500, false, "Lỗi máy chủ");
  }
};

// ======================
// REPORT
// ======================

module.exports.submitReport = async (req, res) => {
  try {
    const currentUser = res.locals.user;

    if (!currentUser) {
      return sendResponse(
        res,
        401,
        false,
        "Chưa đăng nhập"
      );
    }

    const {
      fullname,
      email,
      restaurant,
      report,
      sentiment,
    } = req.body;

    if (!report || !restaurant) {
      return sendResponse(
        res,
        400,
        false,
        "Vui lòng nhập nhà hàng và nội dung báo cáo"
      );
    }

    const restaurantDoc =
      await findRestaurantByInput(restaurant);

    if (!restaurantDoc) {
      return sendResponse(
        res,
        404,
        false,
        "Không tìm thấy nhà hàng"
      );
    }

    await RestaurantReport.create({
      user_id: currentUser._id,
      restaurant_id: restaurantDoc._id,
      fullname: fullname || currentUser.fullName || "",
      email: email || currentUser.email || "",
      restaurant: restaurantDoc.name,
      sentiment: sentiment || "bad",
      report: String(report).trim(),
    });

    return sendResponse(
      res,
      201,
      true,
      "Gửi báo cáo thành công"
    );
  } catch (error) {
    console.error(error);

    return sendResponse(res, 500, false, "Lỗi máy chủ");
  }
};