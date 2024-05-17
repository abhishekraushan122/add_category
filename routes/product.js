const router = require("express").Router();
const Product = require("../models/Product");
const bcrypt = require("bcryptjs");
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");


router.post("/addcategory", async (req,res) => {
const newProduct= new Product(req.body);
try{
    const savedProduct = await newProduct.save();
    res.status(200).json(savedProduct);
}catch (err){
    res.status(500).json(err);
}
});
router.put("/update/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body; // Assuming req.body contains the updated data
        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.delete("/delete/:id", async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "User has been deleted." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get("/:id", async (req, res) => {
    try {
        const user = await Product.findById(req.params.id);
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get("/", async (req, res) => {
    const qNew = req.query.new;
    const qCategory = req.query.category;
    try {
        let products;
        if(qNew){
            products = await Product.find.sort({createdAt: -1}).limit(1)
        }else if(qCategory){
            products = await Product.find({
                categories:{
                    $in:[qCategory],
                },

            });
        }else{
           products = await Product.find(); 
        }
        // const users = query ? await Product.find().sort({ _id: -1 }).limit(5) : await Product.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
