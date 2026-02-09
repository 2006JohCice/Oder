const productRouer = require("./product.route");
const homeRouter =require("./home.route")
const search =require("./search.route")
const category = require("./category.route")
const cartRouter =require("./cart.route")
const checkOutRouter = require("./checkout.route")
const userRoure =require("./user.route")
module.exports = (app) => {


    app.use("/api",homeRouter)
    app.use("/api",productRouer)
    app.use("/api",search)
    app.use("/api",category)
    app.use("/api",cartRouter)
    app.use("/api",checkOutRouter)
    app.use("/api",userRoure)

}


