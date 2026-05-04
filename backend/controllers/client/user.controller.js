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
module.exports.passwordRegisterOtp = async (req, res) => {
  console.log("Password Register OTP:", req.body);
  if (
    !req.body ||
    !req.body.fullName ||
    !req.body.email ||
    !req.body.password ||
    !req.body.confirmPassword
  ) {
    return res.status(400).json({ message: "Nháº­p ThÃ´ng Tin Äáº§y Äá»§" });
  }
  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({ messagePassword: "Máº­t Kháº©u KhÃ´ng Khá»›p" });
  }



  const existEmail = await User.find({
    email: req.body.email,
    deleted: false,
  });

  if (existEmail.length > 0) {
    return res.status(400).json({ message: "Email Ä‘Ã£ tá»“n táº¡i" });
  }
  const otpRamdon = generateHelper.generateRandomNumber(6);

  const objectForgotPassword = {
    email: req.body.email,
    otp: otpRamdon,
    type: "register",
    expireAt: Date.now() + 60 * 1000,
  };
  console.log("obj otp password",objectForgotPassword)
  // console.log("Forgot Password Object:", otpRamdon);
  const forgotPassword = new ForgotPassword(objectForgotPassword);
  await forgotPassword.save();
  const subject = "YÃªu Táº¡o TÃ i Khoáº£n Má»›i Vá»›i Order Local ";
  // const html = `MÃ£ OTP cá»§a báº¡n lÃ : <b>${otpRamdon}</b>. MÃ£ OTP nÃ y sáº½ háº¿t háº¡n sau 1 phÃºt. Náº¿u báº¡n khÃ´ng yÃªu cáº§u táº¡o tÃ i khoáº£n, vui lÃ²ng bá» qua email nÃ y.`;
  const html = `
<!DOCTYPE html>
<html lang="vi">

<head>
  <meta charset="UTF-8">
</head>

<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">

  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6f8; padding:20px;">
    <tr>
      <td align="center">

        <table width="500" cellspacing="0" cellpadding="0"
          style="background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">

          <!-- Header Image -->
          <tr>
            <td>
              <img src="https://cdn-icons-png.flaticon.com/512/3064/3064197.png" alt="OTP" width="100%" style="    /* right: 31%; */
    left: 45%;
    justify-content: center;
    text-align: center;
    position: relative;
    height: 50px;
    width: 50px;
    display: grid;
    top: 6px;">
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:30px; text-align:center;">

              <h2 style="color:#333; margin-bottom:10px;">XÃ¡c thá»±c tÃ i khoáº£n</h2>

              <p style="color:#666; font-size:14px;">
                Xin chÃ o,<br>
                ÄÃ¢y lÃ  mÃ£ OTP cá»§a báº¡n:
              </p>

              <div style="margin:20px 0;">
                <span
                  style="display:inline-block; background:#4CAF50; color:#fff; font-size:28px; letter-spacing:5px; padding:15px 25px; border-radius:8px; font-weight:bold;">
                  ${otpRamdon}
                </span>
              </div>

              <p style="color:#666; font-size:14px;">
                MÃ£ OTP sáº½ háº¿t háº¡n sau <b>1 phÃºt</b>.
              </p>

              <p style="color:#999; font-size:12px; margin-top:20px;">
                Náº¿u báº¡n khÃ´ng yÃªu cáº§u táº¡o tÃ i khoáº£n, vui lÃ²ng bá» qua email nÃ y.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f0f0f0; padding:15px; text-align:center;">
              <p style="margin:0; font-size:12px; color:#888;">
                Â© ORDER SHOP
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

  // sendMailHelper.sendMail( req.body.email, subject, html);
  try {
    await sendMailHelper.sendMail(req.body.email, subject, html);

    return res.status(200).json({
      message: "ÄÃ£ gá»­i OTP vá» email"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Gá»­i email tháº¥t báº¡i"
    });
  }

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
    return res.status(400).json({ message: "Nháº­p ThÃ´ng Tin Äáº§y Äá»§" });
  }
  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({ messagePassword: "Máº­t Kháº©u KhÃ´ng Khá»›p" });
  }

  const existEmail = await User.find({
    email: req.body.email,
    deleted: false,
  });

  if (existEmail.length > 0) {
    return res.status(400).json({ message: "Email Ä‘Ã£ tá»“n táº¡i" });
  }

  const userRegister = await ForgotPassword.findOne({
    email: req.body.email,
    otp: req.body.otp,
    type: "register",
  });
  if (!userRegister) {
    return res.status(400).json({
      message: "XÃ¡c Thá»±c KhÃ´ng ThÃ nh CÃ´ng Kiá»ƒm Tra Láº¡i Email Hoáº·c OTP",
    });
  } else {
    req.body.password = md5(req.body.password);

    const user = new User(req.body);
    await user.save();
    res.cookie("tokenUser", user.tokenUser, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    console.log("Newly registered user:", user);
    return res.status(201).json({ message: "ÄÄƒng kÃ½ thÃ nh cÃ´ng" });
  }
};

// [POST] api/user/login
module.exports.login = async (req, res) => {
  console.log("Login user:", req.body);
  if (!req.body || !req.body.email || !req.body.password) {
    return res.status(400).json({ message: "Nháº­p ThÃ´ng Tin Äáº§y Äá»§" });
  }

  const user = await User.findOne({
    email: req.body.email,
    password: md5(req.body.password),
    deleted: false,
  });

  if (!user) {
    return res.status(400).json({ message: "Email hoáº·c Máº­t Kháº©u KhÃ´ng ÄÃºng" });
  }

  if (user.status !== "active") {
    return res
      .status(400)
      .json({ alerts: "TÃ i khoáº£n cá»§a báº¡n khÃ´ng cÃ²n hoáº¡t Ä‘á»™ng" });
  }
  res.cookie("tokenUser", user.tokenUser, {
    httpOnly: true,
    secure: false,        // dev localhost
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  console.log("Logged in user:", user);
  return res.status(200).json({ message: "ÄÄƒng nháº­p thÃ nh cÃ´ng" });
};
// [GET] api/user/logout
module.exports.logout = async (req, res) => {
  res.clearCookie("tokenUser");
  return res.status(200).json({ message: "ÄÄƒng xuáº¥t thÃ nh cÃ´ng" });
};
// Create OTP For Forgot Password
//[POST] /api/user/password/forgot
module.exports.forgotPassword = async (req, res) => {
  const { email, password, confirmPassword, otp } = req.body;
  if (!email || !confirmPassword || !password) {
    return res.status(400).json({ message: "Nháº­p ThÃ´ng Tin Äáº§y Äá»§" });
  }
  if (password != confirmPassword) {
    return res.status(400).json({ messagePassword: "Máº­t Kháº©u KhÃ´ng Khá»›p" });
  }
  const user = await User.findOne({
    email: email,
    deleted: false,
  });
  // console.log(user)
  if (!user) {
    return res.status(400).json({
      alerts: "TÃ i Khoáº£n Email KhÃ´ng Tá»“n Táº¡i",
    });
  }
  const otpRamdon = generateHelper.generateRandomNumber(6);
  const objectForgotPassword = {
    email: email,
    otp: otpRamdon,
    expireAt: Date.now() + 60 * 1000,
  };

  // console.log(objectForgotPassword)
  const forgotPassword = new ForgotPassword(objectForgotPassword);
  await forgotPassword.save();
  const subject = "YÃªu Cáº§u Äáº·t Láº¡i Máº­t Kháº©u";
  // const html = `MÃ£ OTP cá»§a báº¡n lÃ : <b>${otpRamdon}</b>. MÃ£ OTP nÃ y sáº½ háº¿t háº¡n sau 1 phÃºt. Náº¿u báº¡n khÃ´ng yÃªu cáº§u Ä‘áº·t láº¡i máº­t kháº©u, vui lÃ²ng bá» qua email nÃ y.`;
  const html = `
<!DOCTYPE html>
<html lang="vi">

<head>
  <meta charset="UTF-8">
</head>

<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">

  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6f8; padding:20px;">
    <tr>
      <td align="center">

        <table width="500" cellspacing="0" cellpadding="0"
          style="background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">

          <!-- Header Image -->
          <tr>
            <td>
              <img src="https://cdn-icons-png.flaticon.com/512/3064/3064197.png" alt="OTP" width="100%" style="    /* right: 31%; */
    left: 45%;
    justify-content: center;
    text-align: center;
    position: relative;
    height: 50px;
    width: 50px;
    display: grid;
    top: 6px;">
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:30px; text-align:center;">

              <h2 style="color:#333; margin-bottom:10px;">XÃ¡c thá»±c tÃ i khoáº£n</h2>

              <p style="color:#666; font-size:14px;">
                Xin chÃ o ,<br>
                ÄÃ¢y lÃ  mÃ£ OTP cá»§a báº¡n:
              </p>

              <div style="margin:20px 0;">
                <span
                  style="display:inline-block; background:#4CAF50; color:#fff; font-size:28px; letter-spacing:5px; padding:15px 25px; border-radius:8px; font-weight:bold;">
                  ${otpRamdon}
                </span>
              </div>

              <p style="color:#666; font-size:14px;">
                MÃ£ OTP sáº½ háº¿t háº¡n sau <b>1 phÃºt</b>.
              </p>

              <p style="color:#999; font-size:12px; margin-top:20px;">
                Náº¿u báº¡n khÃ´ng yÃªu cáº§u táº¡o tÃ i khoáº£n, vui lÃ²ng bá» qua email nÃ y.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f0f0f0; padding:15px; text-align:center;">
              <p style="margin:0; font-size:12px; color:#888;">
                Â© ORDER SHOP
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
  
  sendMailHelper.sendMail(email, subject, html);
  return res.status(200).json({
    message: "ÄÃ£ gá»­i OTP vá» email"
  });
};

//[POST] /user/password/otp
module.exports.otpPasswordPost = async (req, res) => {
  const { email, password, confirmPassword, otp } = req.body;
  if (!email || !confirmPassword || !password || !otp) {
    return res.status(400).json({ message: "Nháº­p ThÃ´ng Tin Äáº§y Äá»§" });
  }
  if (password != confirmPassword) {
    return res.status(400).json({ messagePassword: "Máº­t Kháº©u KhÃ´ng Khá»›p" });
  }
  const user = await ForgotPassword.findOne({
    email: email,
    otp: otp,
  });
  // console.log(user)
  if (!user) {
    return res.status(400).json({
      alerts: "XÃ¡c Thá»±c KhÃ´ng ThÃ nh CÃ´ng Kiá»ƒm Tra Láº¡i Email, Máº­t Kháº©u Hoáº·c OTP",
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

};

//[GET] /api/user/me
module.exports.infoUser = async (req, res) => {
  if (res.locals.user) {
    res.json({ user: res.locals.user });
  } else {
    res.status(401).json({ message: "ChÆ°a Ä‘Äƒng nháº­p" });
  }
  console.log("check user",res.locals.user);
};

// [PATCH] /api/user/profile
module.exports.updateProfile = async (req, res) => {
  try {
    const currentUser = res.locals.user;
    if (!currentUser) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const { fullname, phone, avatar } = req.body || {};
    const updateData = {};

    if (typeof fullname === "string") {
      updateData.fullname = fullname.trim();
    }

    if (typeof phone === "string") {
      updateData.phone = phone.trim();
    }

    if (typeof avatar === "string") {
      updateData.avatar = avatar.trim();
    }

    await User.updateOne({ _id: currentUser._id }, updateData);
    const user = await User.findById(currentUser._id).select("-password");

    return res.status(200).json({
      message: "Cập nhật thông tin thành công",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};