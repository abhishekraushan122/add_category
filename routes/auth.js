const router = require("express").Router();
const User =require("../models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");

const SECRET_KEY = 'NOTESAPI';
//send mail
const sendverifyMail = async(username, email, user_id) =>{
    try{
        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:'abhishekmawai12@gmail.com',
                pass:'vbhdxtdynhecunta'
            }
        });
        const mailOptions = {
            from:'abhishekmawai12@gmail.com',
            to:email,
            subject:'For Verification mail',
            html: `<p>Hi ${username}, please click here to <a href="http://localhost:4000/api/auth/verify?id=${user_id}">verify your email</a></p>`
        }
        transporter.sendMail(mailOptions, function(error,info){
            if(error){
                console.log(error);
            }
            else{
                console.log("Email has been sent:- ",info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
} 

}

router.post("/register", async (req,res) => {
  
        const existingUser = await User.findOne({ $or: [{ email: req.body.email }] });
        if (existingUser) {
          return res.status(400).json({ error: 'email already exists' });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
        username:req.body.username,
        email:req.body.email,
        password: hashedPassword,
        is_verified: 0
    });

    try{
    const savedUser = await newUser.save();
    const token = jwt.sign({ email: savedUser.email, id: savedUser._id }, SECRET_KEY,{ expiresIn: "1h" });
    await sendverifyMail(savedUser.username, savedUser.email, savedUser._id);
    res.status(201).json({ data: savedUser,message:" Please check your email to verify your account", token: token });

    }catch (err) {
        res.status(500).json(err);
    }
});

//verify mail
const verifyMail = async (req, res) => {
    try {
        console.log("Verification request received for user ID:", req.query.id);

        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } });

        if (updateInfo.nModified === 0) {
            console.log("User not found or already verified");
            return res.status(400).send("User not found or already verified");
        }

        console.log("Verification successful:", updateInfo);
        res.status(200).send("Email successfully verified");
    } catch (error) {
        console.log("Error during verification:", error.message);
        res.status(500).send("An error occurred during email verification");
    }
};

router.get('/verify', verifyMail);

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