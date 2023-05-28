const mongoose = require("mongoose");
//HOTEL API - HOTEL VENDOR ADD HOTELS
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Hotel Name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please Enter Hotel Description"],
  },
  address: {
    required: true,
    type: String,
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
  state: {
    required: true,
    type: String,
    set: function (value) {
      // Remove all blank spaces from the value and convert it to uppercase
      return value.toUpperCase();
      // return value.replace(/\s+/g, '').toUpperCase();
    },
  },

  nearby: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: [true, "Please Enter product Price"],
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
  roomtype: [
    {
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  Category: {
    type: String,
    required: [true, "Please Enter Product Category"],
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

  ammeneties: [
    {
      name: String,
    },
  ],
  type: {
    type: String,
    default: "hotel",
  },
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
    ref: "Vendor",
    required: true,
    // type : String
    // select:true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);


// const Post = require('./models/Post');
// const User = require('./models/User');

// // Retrieve a post and populate the user field
// const post = await Post.findById(postId).populate('user');

// // Access the user's name
// console.log(post.user.name);