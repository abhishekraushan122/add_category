const router = require("express").Router();
const Cart = require("../models/Cart");
const bcrypt = require("bcryptjs");
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");


router.post("/addcart", async (req,res) => {
const newCart= new Cart(req.body);
try{
    const savedCart = await newCart.save();
    res.status(200).json(savedCart);
}catch (err){
    res.status(500).json(err);
}
});
router.put("/update/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body; // Assuming req.body contains the updated data
        const updatedCart = await Cart.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedCart) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(updatedCart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.delete("/delete/:id", async (req, res) => {
    try {
        await Cart.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "User has been deleted." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get("/find/:userId", async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId });

        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get("/", async (req, res) => {
   
    try {
        const carts=await Cart.find();
        res.status(200).json(carts);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
