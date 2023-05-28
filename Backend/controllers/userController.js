const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const Trip = require("../models/requestsModel");

// Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "useravatars",
        width: 150,
        crop: "scale",
    });

    const { name, email,MobileNumber,password } = req.body;
if (
  password.length < 8 ||
  !/[!@#$%^&*]/.test(password) ||
  !/\d/.test(password) ||
  !/[A-Z]/.test(password)
) {
  return res
    .status(400)
    .json({
      error:
        "Invalid password. It must contain at least 8 characters, one special character, one number, and one capital letter.",
    });
}
    const user = await User.create({
        name,
        email,
        MobileNumber,
        password,
       
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
    //     user
    // });
    sendToken(user, 201, res);
});


exports.saveRequest = async (req, res, next) => {
  const { name, email, destination, startDate, endDate, requirements } =
    req.body;
  try {
    // Create a new Trip object with the form data
    const newTrip = new Trip({
      name,
      email,
      destination,
      startDate,
      endDate,
      requirements,
    });

    // Save the new Trip object to the database
    const savedTrip = await newTrip.save();

    // Return a success response
    res
      .status(200)
      .json({ success: true, message: "Request submitted successfully" });
  } catch (error) {
    // Handle any errors that occur during the saving process
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error submitting request" });
  }
};
exports.getRequest = async (req, res, next) => {
  try {
    // Find all documents in the Trip collection
    const trips = await Trip.find();

    // Get the total count of documents
    const totalCount = await Trip.countDocuments();

    // Return the trips and totalCount in the response
    res.status(200).json({ success: true, trips, totalCount });
  } catch (error) {
    // Handle any errors that occur during the retrieval process
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error retrieving requests" });
  }
};



// // Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    // checking if user has given password and email both

    if (!email || !password) {
        return next(new ErrorHander("Please Enter Email & Password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHander("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHander("Invalid email or password", 401));
    }

    sendToken(user, 200, res);
});

// // Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged Out",
    });
});

// // Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHander("User not found", 404));
    }

    // Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
    const resetPasswordUrl = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: `Budgetrip - User Password Recovery`,
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHander(error.message, 500));
    }
});

// // Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // creating token hash
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(
            new ErrorHander(
                "Reset Password Token is invalid or has been expired",
                400
            )
        );
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHander("Password does not password", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
});

// // Get User Detail
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});


// exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
//   const userId = req.user.id;
//   const user = await User.findById(userId);

//   // Check if the user id in the backend matches with the user id in the Redux store
//   if (userId !== store.getState().user._id) {
//     return res.status(401).json({
//       success: false,
//       message: "Unauthorized access",
//     });
//   }

//   res.status(200).json({
//     success: true,
//     user,
//   });
// });









// // update User password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.userId).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHander("Old password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHander("password does not match", 400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
});

// // update User Profile

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    MobileNumber: req.body.MobileNumber,
  };
  
  if (req.body.avatar !== "") {
    const user = await User.findById(req.params.userId);
   
    const imageId = user.avatar.public_id;

    try {
      await cloudinary.v2.uploader.destroy(imageId);
      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
      });
      newUserData.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Error updating avatar image",
      });
    }
  }

  const user = await User.findByIdAndUpdate(req.params.userId, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});


// // Get all users(admin)
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users,
    });
});

// // Get single user (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(
            new ErrorHander(`User does not exist with Id: ${req.params.id}`)
        );
    }

    res.status(200).json({
        success: true,
        user,
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
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(
            new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
        );
    }

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

    await user.remove();

    res.status(200).json({
        success: true,
        message: "User Deleted Successfully",
    });
});