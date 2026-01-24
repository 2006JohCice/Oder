// const infoOrderControllers = require("../../models/InfoUserOrder.model");
const md5 = require('md5');
const Account = require("../../models/account.model");


// [GET] /auth/login
module.exports.login = async (req, res) => {



}
// [POST] /auth/login


module.exports.loginPost = async (req, res) => {
    const { email, password } = req.body;
    const user = await Account.findOne({
        email: email,
        deleted: false
    })

    if (!user) {
        return res.status(400).json({
            message: "Email không tồn tại",
            alerts: "Tài Khoản chưa tồn tại - Liên hệ ADMIN"
        });
    }
    if (user.status === "inActive") {
        return res.status(400).json({
            alerts: "Tài Khoản Đã Bị Khóa - Liên hệ ADMIN"
        });
    }
    if (md5(password) != user.password) {
        return res.status(400).json({
            messagePassword: "Mật khẩu sai !"
        });
    }


    res.cookie("token",user.token)
    return res.status(200).json(
        {
          message: "Đăng nhập thành công",
        }
    );


}
// [get] /auth/logout
module.exports.logout = async (req, res) => {

    res.clearCookie("token");
    
     return res.status(200).json(
        {
          message: "Đăng Xuất Thành Công",
        }
    );

}






