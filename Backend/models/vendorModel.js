const mongoose = require("mongoose");
const Validator = require('validator');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const vendorSchema = new mongoose.Schema({
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
    validate: [Validator.isEmail, "Please Enter a valid Email"],
  },
  MobileNumber: {
    type: String,
    require: [true, "Please enter your Mobile Number"],
    unique: true,
    validate: [Validator.isMobilePhone, "Please Enter a valid Mobile Number"],
    maxLength: [10, "Cannot less than 10 digit"],
  },
  PanNumber: {
    type: String,
    require: [true, "Please enter your PAN Number"],
    unique: true,

    maxLength: [10],
    minLength: [10],
    set: function (value) {
      // Remove all blank spaces from the value and convert it to uppercase
      return value.toUpperCase();
      // return value.replace(/\s+/g, '').toUpperCase();
    },
  },
  GSTNumber: {
    type: String,
    require: [true, "Please enter your GST Number"],
    unique: true,
    maxLength: [15],
    minLength: [15],
    set: function (value) {
      // Remove all blank spaces from the value and convert it to uppercase
      return value.toUpperCase();
      // return value.replace(/\s+/g, '').toUpperCase();
    },

    //validate: [Validator.isGST, "Please Enter a valid GST Number"],
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
    default: "vendor",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  resetPasswordToken1: String,
  resetPasswordExpire: Date,
});

vendorSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});

// JWT TOKEN
vendorSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Compare Password

vendorSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// // Generating Password Reset Token
vendorSchema.methods.getResetPasswordToken = function () {
    // Generating Token
    const resetToken1 = crypto.randomBytes(20).toString("hex");

    // Hashing and adding resetPasswordToken to vendorSchema
    this.resetPasswordToken1 = crypto
        .createHash("sha256")
        .update(resetToken1)
        .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken1;
};

module.exports = mongoose.model("Vendor", vendorSchema);