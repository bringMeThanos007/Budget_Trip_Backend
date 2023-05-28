const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Vendor = require("../models/vendorModel");
const sendTokenv = require("../utils/jwtTokenv");
const sendEmail = require("../utils/sendEmailv");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

// Register a Vendor
exports.registerVendor = catchAsyncErrors(async (req, res, next) => {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "vendoravatars",
        width: 150,
        crop: "scale",
    });

    const { name, email, MobileNumber, password,GSTNumber,PanNumber } = req.body;
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
    const vendor = await Vendor.create({
        name,
        email,
        MobileNumber,
        PanNumber,
        password,
        GSTNumber,
        // avatar: {
        //     public_id: "this is sample id",
        //     url: "sampleurl",
        // },
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        },
    });

    sendTokenv(vendor, 201, res);
});

// Login vendor
exports.loginVendor = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    // checking if vendor has given password and email both

    if (!email || !password) {
        return next(new ErrorHander("Please Enter Email & Password", 400));
    }

    const vendor = await Vendor.findOne({ email }).select("+password");

    if (!vendor) {
        return next(new ErrorHander("Invalid email or password", 401));
    }

    const isPasswordMatched = await vendor.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHander("Invalid email or password", 401));
    }

    sendTokenv(vendor, 200, res);
});

// Logout vendor
exports.logoutVendor = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token1", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged Out",
        
    });
});

// // Forgot Password
exports.forgotPassword1 = catchAsyncErrors(async (req, res, next) => {
    const vendor = await Vendor.findOne({ email: req.body.email });

    if (!vendor) {
        return next(new ErrorHander("Vendor not found", 404));
    }

    // Get ResetPassword Token
    const resetToken1 = vendor.getResetPasswordToken();

    await vendor.save({ validateBeforeSave: false });
// const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/resetv/${resetToken1}`;

    const resetPasswordUrl = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/password/resetv/${resetToken1}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

    try {
        await sendEmail({
            email: vendor.email,
            subject: `Budgettrip-Vendor Password Recovery`,
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${vendor.email} successfully`,
        });
    } catch (error) {
        vendor.resetPasswordToken1 = undefined;
        vendor.resetPasswordExpire = undefined;

        await vendor.save({ validateBeforeSave: false });

        return next(new ErrorHander(error.message, 500));
    }
});

// // Reset Password
exports.resetPassword1 = catchAsyncErrors(async (req, res, next) => {
    // creating token hash
    const resetPasswordToken1 = crypto
        .createHash("sha256")
        .update(req.params.token1)
        .digest("hex");

    const vendor = await Vendor.findOne({
        resetPasswordToken1,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!vendor) {
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

    vendor.password = req.body.password;
    vendor.resetPasswordToken1 = undefined;
    vendor.resetPasswordExpire = undefined;

    await vendor.save();

    sendTokenv(vendor, 200, res);
});

// // Get Vendor Detail
exports.getVendorDetails = catchAsyncErrors(async (req, res, next) => {
    const vendor = await Vendor.findById(req.vendor.id);

    res.status(200).json({
        success: true,
        vendor,
    });
});

// // update Vendor password
exports.updatePasswordv = catchAsyncErrors(async (req, res, next) => {
    const vendor = await Vendor.findById(req.params.vendorId).select("+password");

    const isPasswordMatched = await vendor.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHander("Old password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHander("password does not match", 400));
    }

    vendor.password = req.body.newPassword;

    await vendor.save();

    sendTokenv(vendor, 200, res);
});

// update vendor Profile
exports.updateProfile1 = catchAsyncErrors(async (req, res, next) => {
    const newVendorData = {
      name: req.body.name,
      email: req.body.email,
      MobileNumber: req.body.MobileNumber,
    };

    if (req.body.avatar !== "") {
        const vendor = await Vendor.findById(req.params.vendorId);

        const imageId = vendor.avatar.public_id;
try {
  await cloudinary.v2.uploader.destroy(imageId);
  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "vendoravatars",
    width: 150,
    crop: "scale",
  });
  newVendorData.avatar = {
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
        // await cloudinary.v2.uploader.destroy(imageId);

        // const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        //     folder: "avatars",
        //     width: 150,
        //     crop: "scale",
        // });

        // newVendorData.avatar = {
        //     public_id: myCloud.public_id,
        //     url: myCloud.secure_url,
        // };
    }

    const vendor = await Vendor.findByIdAndUpdate(req.params.vendorId, newVendorData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});

// Get all Vendors(admin)
exports.getAllVendor = catchAsyncErrors(async (req, res, next) => {
    const vendors = await Vendor.find();

    res.status(200).json({
        success: true,
        vendors,
    });
});

// // Get single vendor (admin)
exports.getSingleVendor = catchAsyncErrors(async (req, res, next) => {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
        return next(
            new ErrorHander(`Vendor does not exist with Id: ${req.params.id}`)
        );
    }

    res.status(200).json({
        success: true,
        vendor,
    });
});

// // update Vendor Role -- Admin
// exports.updateVendorRole = catchAsyncErrors(async (req, res, next) => {
//     const newVendorData = {
//         name: req.body.name,
//         email: req.body.email,
//         role: req.body.role,
//     };

//     await Vendor.findByIdAndUpdate(req.params.id, newVendorData, {
//         new: true,
//         runValidators: true,
//         useFindAndModify: false,
//     });

//     res.status(200).json({
//         success: true,
//     });
// });

// // Delete Vendor --Admin
exports.deleteVendor = catchAsyncErrors(async (req, res, next) => {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
        return next(
            new ErrorHander(`Vendor does not exist with Id: ${req.params.id}`, 400)
        );
    }

    // const imageId = vendor.avatar.public_id;

    // await cloudinary.v2.uploader.destroy(imageId);

    await vendor.remove();

    res.status(200).json({
        success: true,
        message: "Vendor Deleted Successfully",
    });
});