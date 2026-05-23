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
      sameSite: "strict"
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
      sameSite: "strict" 
    }).send({
      message: "Logout successful"
    });
});
module.exports = authRouter;
