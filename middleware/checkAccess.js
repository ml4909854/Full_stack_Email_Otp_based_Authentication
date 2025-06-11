

const checkAccess = (requiredRole)=>{
    return (req , res , next)=>{
        if(requiredRole !== req.user.role){
            return res.status(400).json({message:"You are authorised. you can't access This page."})
        }
        next()
    }
}
module.exports = checkAccess