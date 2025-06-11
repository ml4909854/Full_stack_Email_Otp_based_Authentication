require("dotenv").config()
const blackList = require("../blackList")
const jwt = require("jsonwebtoken")
const User = require("../model/user.model")

const auth = async(req , res , next)=>{
    try {
        const token = req.headers?.authorization?.split(" ")[1]
        if(blackList.has(token)){
            return res.status(400).json({message:"You are logged out! Please login again!"})
        }
        const decoded = jwt.verify(token , process.env.ACCESS_KEY)
        console.log(decoded)
        req.user = await User.findById(decoded._id)
        console.log(req.user)
        next()
    } catch (error) {
        res.status(500).json({error:"Erorr to authenticate User!"})
    }
}

module.exports = auth