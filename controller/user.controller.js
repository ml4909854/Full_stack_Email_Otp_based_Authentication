require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");
const User = require("../model/user.model.js");
const nodemailer = require("nodemailer");
const blackList = require("../blackList.js");
const router = express.Router();

// 👉 POST /send-otp
router.post("/send-otp", async (req, res) => {
  try {
    const {username, email, role } = req.body;

    if ( !username||!email) {
      return res.status(400).json({
        message: "Username ,Email and role are required",
      });
    }

    // ✅ Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Set OTP expiry time (5 mins)
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // ✅ Hash the OTP
    const saltRounds = parseInt(process.env.SALTROUND);
    const hashedOtp = await bcrypt.hash(otp, saltRounds);

    let user = await User.findOne({ email });

    if (user) {
      user.otp = hashedOtp;
      user.otpExpiresAt = otpExpiresAt;
    } else {
      user = new User({
        username,
        email,
        role,
        otp: hashedOtp,
        otpExpiresAt,
      });
    }

    await user.save();

    // ✅ Send OTP via Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    });

    return res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
});


// 👉 POST /verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required!" });
    }

    // ✅ Explicitly select otp fields if select: false is used in schema
    const user = await User.findOne({ email }).select("+otp +otpExpiresAt");

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // ✅ Check OTP expiration
    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // ✅ Compare OTP
    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP!" });
    }

  
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const accessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_KEY, {
      expiresIn: "1d",
    });
    const refreshToken = jwt.sign({ _id: user._id }, process.env.REFRESH_KEY, {
      expiresIn: "30d",
    });

    return res.status(200).json({
      message: "OTP verified successfully!",
      accessToken,
      refreshToken,
      userId: user._id,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error verifying OTP!",
      error: error.message,
    });
  }
});


// logout route
router.get("/logout" , (req , res)=>{
    const token = req.headers?.authorization?.split(" ")[1]
    if(token){
        blackList.add(token)
    }
    res.status(200).json({message:"Logout successfully!"})
})

// generate new token 
router.post("/generateToken" , (req , res)=>{
    const refreshToken = req.body.token
    if(refreshToken){
        jwt.verify(refreshToken , process.env.REFRESH_KEY , (err , decode)=>{
            if(err){
                return res.status(400).json({message:"Error to genereate a new Token"})
            }
            const accessToken = jwt.sign({_id:decode._id} , process.env.ACCESS_KEY  , {expiresIn:"1d"})
            return res.status(200).json({message:"token generated" , accessToken})
        })
    }

})
module.exports = router;
