const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Vendor = require("../models/vendorModel");
const Guide = require("../models/guideModel");
// import store from "./path/to/store.js";
// import Cookies from "js-cookie";
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return next(new ErrorHander("Please Login to access this resource", 401));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
//   console.log(User.decodedData.id);
    req.user = await User.findById(decodedData.id);

    next();
});

// exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
//   const { user } = req.store.getState(); // Get the user object from the Redux state
//   if (!user.isAuthenticated) {
//     return next(new ErrorHander("Please Login to access this resource", 401));
//   }

//   req.user = await User.findById(user.user._id); // Get the user object using _id from the Redux state

//   next();
// });

exports.isAuthenticatedVendor = catchAsyncErrors(async (req, res, next) => {
  const { token1 } = req.cookies;
  if (!token1) {
    return next(new ErrorHander("Please Login to access this resource", 401));
  }

  const decodedData = jwt.verify(token1, process.env.JWT_SECRET);
  //   console.log(User.decodedData.id);
  req.vendor = await Vendor.findById(decodedData.id);

  next();
});
// exports.isAuthenticatedVendor = catchAsyncErrors(async (req, res, next) => {
//     const { token1 } = req.cookies;

//     if (!token1) {
//         return next(new ErrorHander("Please Login to access this resource", 401));
//     }

//     const decodedData1 = jwt.verify(token1, process.env.JWT_SECRET);

//     req.vendor = await Vendor.findById(decodedData1.id);

//     next();
// });
exports.isAuthenticatedGuide = catchAsyncErrors(async (req, res, next) => {
    const { token2 } = req.cookies;

    if (!token2) {
        return next(new ErrorHander("Please Login to access this resource", 401));
    }

    const decodedData2 = jwt.verify(token2, process.env.JWT_SECRET);
    //   console.log(User.decodedData.id);
    req.guide = await Guide.findById(decodedData2.id);

    next();
});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHander(
                    `Role: ${req.user.role} is not allowed to access this resouce `,
                    403
                )
            );
        }

        next();
    };
};
exports.authorizeRoles1 = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.vendor.role)) {
            return next(
                new ErrorHander(
                    `Role: ${req.vendor.role} is not allowed to access this resouce `,
                    403
                )
            );
        }

        next();
    };
};
exports.authorizeRoles2 = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.guide.role)) {
            return next(
                new ErrorHander(
                    `Role: ${req.guide.role} is not allowed to access this resouce `,
                    403
                )
            );
        }

        next();
    };
};