const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Guide = require("../models/guideModel");
const sendTokeng = require("../utils/jwtTokeng");
const ApiFeatures = require("../utils/apifeatures");
const sendEmail = require("../utils/sendEmailg");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

// Register a User
exports.registerGuide = catchAsyncErrors(async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "guideavatars",
    width: 150,
    crop: "scale",
  });

  const { name, email, MobileNumber, password, currloc } = req.body;
if (
  password.length < 8 ||
  !/[!@#$%^&*]/.test(password) ||
  !/\d/.test(password) ||
  !/[A-Z]/.test(password)
) {
  return res.status(400).json({
    error:
      "Invalid password. It must contain at least 8 characters, one special character, one number, and one capital letter.",
  });
}
  const guide = await Guide.create({
    name,
    email,
    MobileNumber,
    password,
    currloc,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
    // avatar: {
    //     public_id: "this is sample id",
    //     url: "sampleurl",
    // },
  });
  // const token = user.getJWTToken();
  // res.status(201).json({
  //     success: true,
  //     token,
  // });
  sendTokeng(guide, 201, res);
});

// // Login User
exports.loginGuide = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user has given password and email both

  if (!email || !password) {
    return next(new ErrorHander("Please Enter Email & Password", 400));
  }

  const guide = await Guide.findOne({ email }).select("+password");

  if (!guide) {
    return next(new ErrorHander("Invalid email or password", 401));
  }

  const isPasswordMatched = await guide.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Invalid email or password", 401));
  }

  sendTokeng(guide, 200, res);
});

// // Logout User
exports.logoutGuide = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token2", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// // Forgot Password
exports.forgotPassword2 = catchAsyncErrors(async (req, res, next) => {
  const guide = await Guide.findOne({ email: req.body.email });

  if (!guide) {
    return next(new ErrorHander("Guide not found", 404));
  }

  // Get ResetPassword Token
  const resetToken2 = guide.getResetPasswordToken();

  await guide.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
  )}/api/v1/password/resetg/${resetToken2}`;
  // const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/resetg/${resetToken2}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

  try {
    await sendEmail({
      email: guide.email,
      subject: `Budgetrip-Guide Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${guide.email} successfully`,
    });
  } catch (error) {
    guide.resetPasswordToken2 = undefined;
    guide.resetPasswordExpire = undefined;

    await guide.save({ validateBeforeSave: false });

    return next(new ErrorHander(error.message, 500));
  }
});

// // Reset Password
exports.resetPassword2 = catchAsyncErrors(async (req, res, next) => {
  // creating token hash
  const resetPasswordToken2 = crypto
    .createHash("sha256")
    .update(req.params.token2)
    .digest("hex");

  const guide = await Guide.findOne({
    resetPasswordToken2,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!guide) {
    return next(
      new ErrorHander(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHander("Password does not matched", 400));
  }

  guide.password = req.body.password;
  guide.resetPasswordToken2 = undefined;
  guide.resetPasswordExpire = undefined;

  await guide.save();

  sendTokeng(guide, 200, res);
});

// // Get User Detail
exports.getGuideDetails = catchAsyncErrors(async (req, res, next) => {
  const guide = await Guide.findById(req.guide.id);

  res.status(200).json({
    success: true,
    guide,
  });
});

// // update User password
exports.updatePasswordg = catchAsyncErrors(async (req, res, next) => {
  const guide = await Guide.findById(req.params.guideId).select("+password");

  const isPasswordMatched = await guide.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHander("password does not match", 400));
  }

  guide.password = req.body.newPassword;

  await guide.save();

  sendTokeng(guide, 200, res);
});

// // update User Profile
exports.updateProfile2 = catchAsyncErrors(async (req, res, next) => {
  const newGuideData = {
    name: req.body.name,
    email: req.body.email,
    MobileNumber: req.body.MobileNumber,
    status: req.body.status,
    currloc: req.body.currloc,
  };

  // if (req.body.avatar !== "") {
  //     const guide = await Guide.findById(req.params.guideId);

  //     const imageId = guide.avatar.public_id;
  //     try {
  //       await cloudinary.v2.uploader.destroy(imageId);
  //       const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
  //         folder: "guideavatars",
  //         width: 150,
  //         crop: "scale",
  //       });
  //       newGuideData.avatar = {
  //         public_id: myCloud.public_id,
  //         url: myCloud.secure_url,
  //       };
  //     } catch (err) {
  //       console.log(err);
  //       return res.status(400).json({
  //         success: false,
  //         message: "Error updating avatar image",
  //       });
  //     }

  // await cloudinary.v2.uploader.destroy(imageId);

  // const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
  //     folder: "avatars",
  //     width: 150,
  //     crop: "scale",
  // });

  // newUserData.avatar = {
  //     public_id: myCloud.public_id,
  //     url: myCloud.secure_url,
  // };
  // }

  const guide = await Guide.findByIdAndUpdate(
    req.params.guideId,
    newGuideData,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

// // Get all users(admin)
// exports.getAllGuide = catchAsyncErrors(async (req, res, next) => {
//     const guides = await Guide.find();

//     res.status(200).json({
//         success: true,
//         guides,
//     });
// });

exports.getAllGuide = catchAsyncErrors(async (req, res, next) => {
  const { currloc, status } = req.query;

  let query = { role: "guide" }; // Filter by role === "guide"

  if (currloc && status) {
    query.currloc = currloc;
    query.status = status.toUpperCase();
  } else if (currloc) {
    query.currloc = currloc;
  }

  const guidesCount = await Guide.countDocuments(query);

  const guides = await Guide.find(query);

  const filteredGuidesCount = guides.length;

  res.status(200).json({
    success: true,
    guides,
    guidesCount,
    filteredGuidesCount,
  });
});

// // Get single user (admin)
exports.getSingleGuide = catchAsyncErrors(async (req, res, next) => {
  const guide = await Guide.findById(req.params.id);

  if (!guide) {
    return next(
      new ErrorHander(`Guide does not exist with Id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    guide,
  });
});

// // update User Role -- Admin
// exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
//     const newUserData = {
//         name: req.body.name,
//         email: req.body.email,
//         role: req.body.role,
//     };

//     await User.findByIdAndUpdate(req.params.id, newUserData, {
//         new: true,
//         runValidators: true,
//         useFindAndModify: false,
//     });

//     res.status(200).json({
//         success: true,
//     });
// });

// // Delete User --Admin
exports.deleteGuide = catchAsyncErrors(async (req, res, next) => {
  const guide = await Guide.findById(req.params.id);

  if (!guide) {
    return next(
      new ErrorHander(`Guide does not exist with Id: ${req.params.id}`, 400)
    );
  }

  // const imageId = user.avatar.public_id;

  // await cloudinary.v2.uploader.destroy(imageId);

  await guide.remove();

  res.status(200).json({
    success: true,
    message: "Guide Deleted Successfully",
  });
});
