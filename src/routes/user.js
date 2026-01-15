const express = require("express");
const userRouter = express.Router();
const userAuth = require("../middlewares/authentication");
const User = require("../models/user.js");
const bcrypt = require("bcrypt")

userRouter.get("/user", userAuth, async (req, res) => {
  try {
    const user = req.user;

    return res.send(user);
  } catch (err) {
    res
      .status(400)
      .send("Error occured while fetching user details " + err.message);
  }
});

userRouter.patch("/user", userAuth, async (req, res) => {
  try {
    _id = req.user._id;
    const ALLOWED_UPDATES = [
      "firstName",
      "lastName",
      "photoUrl",
      "skills",
      "about",
      "gender",
      "age",
    ];
    const isUpdateAllowed = Object.keys(req.body).every((val) =>
      ALLOWED_UPDATES.includes(val)
    );
    if (!isUpdateAllowed) {
      return res.send("User trying to update the restricted field");
    }
    const user = await User.findByIdAndUpdate(_id, req.body, {
      runValidators: true,
    });
    if (!user) {
      return res.send("No such user exist");
    }
    res.send("User info updated successfully ");
  } catch (err) {
    res.send("Some error occured while updating user details " + err.message);
  }
});

userRouter.post("/user/changePassword", userAuth, async (req, res)=> {
    try{
        const user = req.user;
        const {oldPassword, newPassword } = req.body;

        const isOldPasswordCorrect= await bcrypt.compare(oldPassword, user.password)

        if(!isOldPasswordCorrect){
            throw new Error("Please enter correct password");
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await User.findOneAndUpdate({emailId:user.emailId}, {password : hashedNewPassword});
        res.cookie("token", null, {expires : new Date(Date.now())});

        return res.send("Password Updated Successfully !!!")
    }catch(err){
        res.status(400).send("Some Error Occured while reseting the password : "+err.message);
    }
})

module.exports = userRouter;
