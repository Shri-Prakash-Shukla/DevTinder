const bcrypt = require("bcrypt");
const User = require("../models/user");
const express = require("express");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");

authRouter.post("/signup", async (req, res) => {
  try {
    const userData = req.body;
    userData.password = await bcrypt.hash(userData.password, 10);
    const user = new User(userData);
    await user.save();
    res.json({
      message: `${user.firstName} Registered successfully`,
    });
  } catch (err) {
    res.status(400).send(`Error : ${err.message}`);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const emailId = req.body.emailId;
    const password = req.body.password;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Wrong Credential");
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new Error("Wrong Credential");
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

    res.cookie("token", token, {
      maxAge: 1 * 24 * 60 * 60 * 1000,
      httpOnly : true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }).send({
      "message" : "Logged in successfully",
      "data" : user
    });
  } catch (err) {
    res
      .status(400)
      .send(err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.clearCookie("token", {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" 
    }).send({
      message: "Logout successful"
    });
});

authRouter.get("/auth/callback", async(req, res)=>{
  try{

    const authorization_code = req.query.code;

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method : "POST",
      headers : {"Content-type":"application/x-www-form-urlencoded"},
      body : new URLSearchParams({
        code : authorization_code,
        client_id : process.env.GOOGLE_CLIENT_ID,
        client_secret : process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri : "http://localhost:3000/auth/callback",
        grant_type : "authorization_code"
      })
    })

    const tokens = await tokenResponse.json();

    const {email, given_name, family_name} = JSON.parse(
      Buffer.from(tokens.id_token.split(".")[1], "base64").toString()
    );

    var user = await User.findOne({emailId : email});

    if(!user){
      const crypto = require("crypto");
      var randomPassword = crypto.randomBytes(24).toString("hex") + "Aa1!";
      randomPassword = await bcrypt.hash(randomPassword, 10);
      const new_user = new User({
        firstName : given_name,
        lastName : family_name,
        emailId : email,
        password : randomPassword
      })

      user = await new_user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

    res.cookie("token", token, {
      maxAge: 1 * 24 * 60 * 60 * 1000,
      httpOnly : true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }).redirect("http://localhost:4200/feed");

  }catch(err){
    res.status(500).send({
      "message" : err.message
    })
  }
})
module.exports = authRouter;
