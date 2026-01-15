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
      throw new Error("User not found");
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new Error("Wrong Credential");
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY);

    res.cookie("token", token).send("Logged in successfully");
  } catch (err) {
    res
      .status(400)
      .send("Something went wrong while logging you in " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res
    .cookie("token", null, { expires: new Date(Date.now()) })
    .send("Logout successfull");
});
module.exports = authRouter;
