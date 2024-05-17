const router = require("express").Router();
const Order = require("../models/Order");
const bcrypt = require("bcryptjs");
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");


router.post("/order", async (req,res) => {
const newOrder= new Order(req.body);
try{
    const savedCart = await newOrder.save();
    res.status(200).json(savedCart);
}catch (err){
    res.status(500).json(err);
}
});
router.put("/update/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body; // Assuming req.body contains the updated data
        const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(updatedOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.delete("/delete/:id", async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Order has been deleted." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get("/find/:userId", async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId });

        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get("/", async (req, res) => {
   
    try {
        const orders=await Order.find();
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get("/income", async (req, res) => {
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1))
    const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

    try {
        const income = await Order.aggregate([
            { $match: { createdAt: { $gte: previousMonth } } },
            {
                $project: {
                    month: { $month: "$createdAt" },
                    sales: "$amount",
                }
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: "$sales" },
                }
            }
        ]);
        res.status(200).json(income);
    } catch (err) {
        res.status(500).json(err);
    }
})


module.exports = router;
