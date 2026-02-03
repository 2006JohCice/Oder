const express = require("express");
const router = express.Router();
const Controller = require("../../controllers/admin/auth.controller");
const authMiddleware = require("../../middlewares/admin/auth.middlewares")


router.get('/auth/login', Controller.login);

router.post('/auth/login', Controller.loginPost);

router.get('/auth/logout', Controller.logout);

router.get('/auth/login/me', authMiddleware.requireAuth, (req, res) => {
  res.json({
    user: res.locals.user,
    role: res.locals.role
  });
console.log('res.locals.user:', res.locals.user);
console.log('res.locals.role:', res.locals.role);
// console.log("Vào đây");
});


module.exports = router;
