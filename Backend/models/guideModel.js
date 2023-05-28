const mongoose = require('mongoose');
const Validator = require('validator');

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const guideSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
    maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [4, "Name should have more than 4 characters"],
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
    validate: [Validator.isEmail, "Please provide a valid email"],
  },
  MobileNumber: {
    type: String,
    require: [true, "Please enter your Mobile Number"],
    unique: true,
    minLength: [10, "Cannot less than 10 digit"],
    validate: [Validator.isMobilePhone, "Please Enter a valid Mobile Number"],
  },
  password: {
    type: String,
    required: [true, "Please Enter Your Password"],
    minLength: [8, "Password should be greater than 8 characters"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  role: {
    type: String,
    default: "guide",
  },
  currloc: {
    type: String,
    required: true,
    set: function (value) {
      // Remove all blank spaces from the value and convert it to uppercase
      return value.toUpperCase();
      // return value.replace(/\s+/g, '').toUpperCase();
    },
  },
  status: {
    type: String,
    default: "available",
    set: function (value) {
      // Remove all blank spaces from the value and convert it to uppercase
      return value.toUpperCase();
      // return value.replace(/\s+/g, '').toUpperCase();
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  resetPasswordToken2: String,
  resetPasswordExpire: Date,
});

guideSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});

// // JWT TOKEN
guideSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// // Compare Password

guideSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// // Generating Password Reset Token
guideSchema.methods.getResetPasswordToken = function () {
    // Generating Token
    const resetToken2 = crypto.randomBytes(20).toString("hex");

    // Hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken2 = crypto
        .createHash("sha256")
        .update(resetToken2)
        .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken2;
};

module.exports = mongoose.model("Guide", guideSchema);