const mongoose = require("mongoose");
//Package api- package vendor add whole package
const product1Schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Hotel Name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please Enter Hotel Description"],
  },
  days: {
    required: true,
    type: String,
  },
  nights: {
    required: true,
    type: String,
  },
  state: {
    required: true,
    type: String,
    set: function (value) {
      // Remove all blank spaces from the value and convert it to uppercase
      return value.toUpperCase();
      // return value.replace(/\s+/g, '').toUpperCase();
    },
  },
  from: {
    required: true,
    type: String,
    set: function (value) {
      // Remove all blank spaces from the value and convert it to uppercase
      return value.toUpperCase();
      // return value.replace(/\s+/g, '').toUpperCase();
    },
  },
  city: {
    required: true,
    type: String,
    set: function (value) {
      // Remove all blank spaces from the value and convert it to uppercase
      return value.toUpperCase();
      // return value.replace(/\s+/g, '').toUpperCase();
    },
  },
  dayplans: [
    {
      day: {
        type: Number,
        required: [true, "Please Enter day"],
      },
      summary: {
        type: String,
        required: [true, "Please Enter day summary"],
      },
    },
  ],

  price: {
    type: Number,
    required: [true, "Please Enter package Price"],
    maxLength: [8, "Price cannot exceed 8 characters"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  Category: {
    type: String,
    required: [true, "Please Enter Package Category"],
  },
  Stock: {
    type: Number,
    required: [true, "Please Enter Hotel room Available"],
    maxLength: [4, "Stock cannot exceed 4 characters"],
    default: 1,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  // roomtype: [
  //     {
  //         name: String,
  //         price: Number,
  //         type: String,
  //         required: true,
  //     }
  // ],
  type: {
    type: String,
    default: "package",
  },
  activities: [
    {
      name: String,
    },
  ],
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],

  vendor: {
    type: mongoose.Schema.ObjectId,
    // type : String,
    ref: "Vendor",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product1", product1Schema);