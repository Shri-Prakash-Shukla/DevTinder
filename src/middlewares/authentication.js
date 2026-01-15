const jwt = require("jsonwebtoken")
const User = require("../models/user")
const userAuth = async (req, res, next) => {
    try{
        const token = req.cookies.token;
        if(!token){
            throw new Error("token not found");
        }

        const {userId} = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const user = await User.findById(userId);

        if(!user){
            throw new Error("No Such user found");
        }

        req.user = user ;
        next();
    }catch(err){
        res.status(400).send("User Authentication Failed : " + err.message);
    }
}

module.exports = userAuth