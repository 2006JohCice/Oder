const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const route = require("./routes/client/index.router")
const cookieParser = require('cookie-parser');
const routeAdmin = require("./routes/admin/index.route")
const cors = require('cors');
require('dotenv').config()

const database = require("./config/database")

database.connect()



const app = express();
const port = process.env.PORT || 5000;


// app.use(cors({ origin: "http://localhost:3000" }));
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://oder-xi.vercel.app"
  ],
  // credentials: true
}));


// app.use(cors());
app.use(express.json());
app.use(cookieParser());

// TinyMCE
    // app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
// End TinyMCE


// Route
route(app)
routeAdmin(app)


app.listen(port, () => console.log(`🚀 Server đang chạy tại http://localhost:${port}`));
