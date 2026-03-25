const User = require('../../models/user.model');

module.exports.requireAuth = async (req, res, next) => {
  const tokenUser = req.cookies?.tokenUser;
  
  if (!tokenUser) {
    return res.status(401).json({ 
      message: "Chưa đăng nhập 23", 
      redirect: "/user/auth/login" 
    });
  }

  const user = await User.findOne({
    tokenUser: tokenUser,
    deleted: false
  });

  if (!user) {
    return res.status(401).json({ 
      message: "Token không hợp lệ", 
      redirect: "/user/auth/login" 
    });
  }

  res.locals.user = user;
  next();
};