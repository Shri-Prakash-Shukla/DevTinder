const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    lastName: {
      type: String,
      maxLength: 50,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: function (value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate: function (value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Please Enter a Strong Password");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      lowercase: true,
      validate: function (value) {
        if (!["male", "female", "others"].includes(value)) return false;
      },
    },
    about: {
      type: String,
      default: "hey there, i am using devTinder",
      maxLength: 2000,
    },
    photoUrl: {
        type: String,
        default:
        "https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg",
        validate: function (value) {
            if (!validator.isURL(value)) {
                throw new Error("Invalid Photo Url");
            }
        }, 
   
    },
    skills: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
