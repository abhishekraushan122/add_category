const router = require("express").Router();
const User =require("../models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET_KEY = 'NOTESAPI';
router.post("/register", async (req,res) => {
  
        const existingUser = await User.findOne({ $or: [{ email: req.body.email }] });
        if (existingUser) {
          return res.status(400).json({ error: 'email already exists' });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
        username:req.body.username,
        email:req.body.email,
        password: hashedPassword
,
    });

    try{
    const savedUser = await newUser.save();
    const token = jwt.sign({ email: savedUser.email, id: savedUser._id }, SECRET_KEY,{ expiresIn: "1h" });
    res.status(201).json({ message: savedUser, token: token });

    }catch (err) {
        res.status(500).json(err);
    }
});

//login
router.post("/login", async (req,res) =>{
    let { email, password } = req.body;
 
        let existingUser;
        try {
            existingUser =
                await User.findOne({ email: email });
                if (!existingUser) {
                  return res.status(404).json({ message: 'User not found' });
                }

                const matchPassword = await bcrypt.compare(password,existingUser.password);
                if(!matchPassword){
                  return res.status(400).json({ message: 'Invalid Credentials' });
                }

                const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, SECRET_KEY,{ expiresIn: "1h" });
                res.status(201).json({ user: existingUser,token: token });
        } catch {
            const error =
                new Error(
                    "Error! Something went wrong."
                );
            return next(error);
        }
})
module.exports = router