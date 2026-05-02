
const userAdmin = require("./userAdmin")
const authMiddleware = require("../../middlewares/admin/auth.middlewares")
const productAdmin = require("./productAdmin.route")
const systemConfig = require("../../config/system");
const userAccount = require("./userAccount.route");
const userInforOrder = require("./userInforOrder")
const addcategory = require('./products-category.route')
const role = require('./role.route')
const backUp = require('./backUp.route')
const account = require('./account.route')
const auth = require ('./auth.route')
const setting = require ('./setting.route')
const advertisement = require ('./advertisement.route')
const doneCart = require ('./doneCart')
const restaurant = require('./restaurant.route')

module.exports = (app) => {
    const prefixAdmin = systemConfig.prefixAdmin;

    // app.use("/api" + prefixAdmin + "/auth", auth);
    app.use("/api" + prefixAdmin ,auth) // chạy trước để lấy cookie
    app.use("/api" + prefixAdmin ,auth);
    app.use("/api" + prefixAdmin ,authMiddleware.requireAuth,userAdmin)
    app.use("/api" + prefixAdmin ,authMiddleware.requireAuth,productAdmin) // done
    app.use("/api" + prefixAdmin ,authMiddleware.requireAuth,doneCart)
    app.use("/api" + prefixAdmin ,authMiddleware.requireAuth,userAccount) // lỗi http://localhost:3000/admin/users // đã fix
    app.use("/api" + prefixAdmin ,authMiddleware.requireAuth,userInforOrder) // lỗi http://localhost:3000/admin/reports // đã fix
    app.use("/api" + prefixAdmin ,authMiddleware.requireAuth,addcategory)
    app.use("/api" + prefixAdmin ,authMiddleware.requireAuth,role) // done // đã fix
    app.use("/api" + prefixAdmin ,authMiddleware.requireAuth,backUp) // lỗi về cái map client  // đã fix
    app.use("/api" + prefixAdmin ,authMiddleware.requireAuth,account) // http://localhost:3000/admin/listAccount // đã fix
    app.use("/api" + prefixAdmin ,authMiddleware.requireAuth,setting) // doing
    app.use("/api" + prefixAdmin ,advertisement);
    app.use("/api" + prefixAdmin ,authMiddleware.requireAuth,restaurant);

}