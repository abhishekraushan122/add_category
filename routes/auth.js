const router = require("express").Router();
const User =require("../models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");

const SECRET_KEY = 'NOTESAPI';
//send mail
// const sendverifyMail = async(username, email, user_id) =>{
//     try{
//         const transporter = nodemailer.createTransport({
//             host:'smtp.gmail.com',
//             port:587,
//             secure:false,
//             requireTLS:true,
//             auth:{
//                 user:'abhishekmawai12@gmail.com',
//                 pass:'vbhdxtdynhecunta'
//             }
//         });
//         const mailOptions = {
//             from:'abhishekmawai12@gmail.com',
//             to:email,
//             subject:'For Verification mail',
//             html: `<p>Hi ${username}, please click here to <a href="http://localhost:4000/api/auth/verify?id=${user_id}">verify your email</a></p>`
//         }
//         transporter.sendMail(mailOptions, function(error,info){
//             if(error){
//                 console.log(error);
//             }
//             else{
//                 console.log("Email has been sent:- ",info.response);
//             }
//         })
//     } catch (error) {
//         console.log(error.message);
// } 

// }

// Function to send OTP via email
const sendOtpEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'abhishekmawai12@gmail.com', // Use environment variables for security
                pass: 'vbhdxtdynhecunta' // Use environment variables for security
            }
        });

        const mailOptions = {
            from: 'abhishekmawai12@gmail.com',
            to: email,
            subject: 'Your OTP Code',
            html: `<p>Your OTP code is <b>${otp}</b>. It is valid for 10 minutes.</p>`
        };

        await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully');
    } catch (error) {
        console.error('Error sending OTP email:', error);
    }
};

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiration = new Date(Date.now() + 10 * 60000); // 10 minutes from now

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            is_verified: false,
            otp,
            otp_expiration: otpExpiration
        });

        

        const savedUser = await newUser.save();
        const token = jwt.sign({ email: savedUser.email, id: savedUser._id }, SECRET_KEY, { expiresIn: '1h' });

        await sendOtpEmail(email, otp);

        res.status(201).json({ data: savedUser, message: 'User registered successfully. Please check your email for the OTP to verify your account.', token });

    }
     catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        if (user.is_verified) {
            return res.status(400).json({ error: 'User already verified' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        if (new Date() > user.otp_expiration) {
            return res.status(400).json({ error: 'OTP expired' });
        }

        user.is_verified = true;
        user.otp = undefined; // Clear the OTP
        user.otp_expiration = undefined; // Clear the OTP expiration
        await user.save();

        res.status(200).json({ message: 'Email successfully verified' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//verify mail
// const verifyMail = async (req, res) => {
//     try {
//         console.log("Verification request received for user ID:", req.query.id);

//         const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } });

//         if (updateInfo.nModified === 0) {
//             console.log("User not found or already verified");
//             return res.status(400).send("User not found or already verified");
//         }

//         console.log("Verification successful:", updateInfo);
//         res.status(200).send("Email successfully verified");
//     } catch (error) {
//         console.log("Error during verification:", error.message);
//         res.status(500).send("An error occurred during email verification");
//     }
// };

// router.get('/verify', verifyMail);

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
});
module.exports = router