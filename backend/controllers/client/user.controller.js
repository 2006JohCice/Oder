const User = require("../../models/user.model");
const md5 = require("md5");
// [POST] api/user/register
module.exports.register = async (req, res) => {

    console.log("Register user:", req.body);
    if (!req.body || !req.body.fullName || !req.body.email || !req.body.password || !req.body.confirmPassword) {
        return res.status(400).json({ message: "Nhập Thông Tin Đầy Đủ" });
    }
    if(req.body.password !== req.body.confirmPassword){
        return res.status(400).json({ messagePassword: "Mật Khẩu Không Khớp" });
    }

    const existEmail = await User.find({
        email: req.body.email,
        deleted: false
    });

    if (existEmail.length > 0) {
        return res.status(400).json({ message: "Email đã tồn tại" });
    }

    req.body.password = md5(req.body.password);

    const user = new User(req.body);
    await user.save();
    res.cookie("tokenUser", user.tokenUser, { httpOnly: true , maxAge: 30*24*60*60*1000});
    console.log(user);
    return res.status(201).json({ message: "Đăng ký thành công" });
}

// [POST] api/user/login
module.exports.login = async (req, res) => {
    console.log("Login user:", req.body);
    if (!req.body || !req.body.email || !req.body.password) {
        return  res.status(400).json({ message: "Nhập Thông Tin Đầy Đủ" });
    }

    const user = await User.findOne({
        email: req.body.email,
        password: md5(req.body.password),
        deleted: false
    });

    if (!user) {
        return res.status(400).json({ message: "Email hoặc Mật Khẩu Không Đúng" });
    }

    if (user.status !== "active") {
        return res.status(400).json({ alerts: "Tài khoản của bạn không còn hoạt động" });
    }
    res.cookie("tokenUser", user.tokenUser, { httpOnly: true , maxAge: 30*24*60*60*1000});
    console.log(user);
    return res.status(200).json({ message: "Đăng nhập thành công" });
}
// [GET] api/user/logout
module.exports.logout = async (req, res) => {
    res.clearCookie("tokenUser");
    return res.status(200).json({ message: "Đăng xuất thành công" });
}

//[GET] /api/user/me
module.exports.infoUser = async (req,res) =>{
     if (res.locals.user) {
        res.json({ user: res.locals.user });
    } else {
        res.status(401).json({ message: "Chưa đăng nhập" });
    }
    console.log(res.locals.user)
}