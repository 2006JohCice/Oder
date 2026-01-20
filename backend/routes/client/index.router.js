const productRouer = require("./product.route");
const homeRouter =require("./home.route")
const search =require("./search.route")
// const cartRouter =require("./cart.route")

module.exports = (app) => {


    app.use("/api",homeRouter)
    app.use("/api",productRouer)
    app.use("/api",search)
    // app.use("/api",cartRouter)
    
   
}


