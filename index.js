const express = require("express");
const app = express();
const mongoose = require("mongoose");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const stripeRoute = require("./routes/stripe");
const cors = require('cors');
app.use(cors());
app.use(express.json());

mongoose.connect(
    'mongodb+srv://abhishekraushan43:Abhishek@cluster0.snu1yj6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    app.use("/api/auth",authRoute);
    app.use("/api/users",userRoute);
    app.use("/api/products",productRoute);
    app.use("/api/carts",cartRoute);
    app.use("/api/orders",orderRoute);
    app.use("/api/stripes",stripeRoute);
    app.listen(4000, () => {
        console.log("Backend server running");
    })