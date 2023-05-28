const Product1 = require("../models/productModel1");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary");



//create product - package vendor
// exports.createProduct1 = catchAsyncErrors(async (req, res, next) => {
//     let images = [];

//     if (typeof req.body.images === "string") {
//         images.push(req.body.images);
//     } else {
//         images = req.body.images;
//     }

//     const imagesLinks = [];

//     for (let i = 0; i < images.length; i++) {
//         const result = await cloudinary.v2.uploader.upload(images[i], {
//             folder: "products1",
//         });

//         // imagesLinks.push({
//         //     public_id: result.public_id,
//         //     url: result.secure_url,
//         // });
//     }

//     // req.body.images = imagesLinks;
//     req.body.vendor = req.vendor.id;

//     const product1 = await Product1.create(req.body);

//     res.status(201).json({
//         success: true,
//         product1,
//     });
// });

exports.createProduct1 = async (req, res) => {
  try {
    const daytypeData = JSON.parse(req.body.dayplans);
    const activityData = JSON.parse(req.body.activities);

    let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products1",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
    // Create a new product with the parsed roomtype
    const product1 = new Product1({
      name: req.body.name,
      description: req.body.description,
      days: req.body.days,
      nights: req.body.nights,
      state: req.body.state,
      city: req.body.city,
      from : req.body.from,
    //   nearby: req.body.nearby,
    dayplans: daytypeData,
      price: req.body.price,
      images: imagesLinks,
      Category: req.body.Category,
      Stock: req.body.Stock,
      activities: activityData,
      vendor: req.body.vendor,
      // Rest of the properties...
    });

    // Save the product to the database
    await product1.save();

    res.status(201).json({ success: true, product1 });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


//get all product
exports.getAllProducts1 = catchAsyncErrors(async (req, res, next) => {
//   const resultPerPage = 3;
  const products1Count = await Product1.countDocuments();

  const apiFeature = new ApiFeatures(Product1.find(), req.query)
    .search1()
    .filter();
    //   .pagination(resultPerPage);

  const products1 = await apiFeature.query;

  const filteredProducts1Count = products1.length;

//   apiFeature.pagination(resultPerPage);

//   products1 = await apiFeature.query;

  res.status(200).json({
    success: true,
    products1,
    products1Count,
    // resultPerPage,
    filteredProducts1Count,
  });
});

// Get All Product (hotelvendor)
// exports.getvendorProducts1 = catchAsyncErrors(async (req, res, next) => {
//     const products1 = await Product1.find();

//     res.status(200).json({
//         success: true,
//         products1,
//     });
// });
exports.getvendorProducts1 = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const vproducts1 = await Product1.find({ vendor: id });

  const totalProducts1 = vproducts1.length;

  res.status(200).json({
    success: true,
    totalProducts1,
    vproducts1,
  });
});
//update package - package vendor

exports.updateProduct1 = catchAsyncErrors(async (req, res, next) => {
    let product1 = await Product1.findById(req.params.id);

    if (!product1) {
        return next(new ErrorHander("Product not found", 404));
    }

    // Images Start Here
    let images = [];

    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    // if (images !== undefined) {
    //     // Deleting Images From Cloudinary
    //     for (let i = 0; i < product1.images.length; i++) {
    //         await cloudinary.v2.uploader.destroy(product1.images[i].public_id);
    //     }

    //     const imagesLinks = [];

    //     for (let i = 0; i < images.length; i++) {
    //         const result = await cloudinary.v2.uploader.upload(images[i], {
    //             folder: "products1",
    //         });

    //         imagesLinks.push({
    //             public_id: result.public_id,
    //             url: result.secure_url,
    //         });
    //     }

    //     req.body.images = imagesLinks;
    // }

    product1 = await Product1.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        product1,
    });
});
//delete package (product) by package vendor
exports.deleteProduct1 = catchAsyncErrors( async (req, res, next) => {
    const product1 = await Product1.findById(req.params.id);
    if (!product1) {
        return next(new ErrorHander("Product not found", 404));
    }
    await product1.remove();
    res.status(200).json({
        success: true,
        message: "deleted successfully"
    })

})

//Get package(product) details on opening
exports.getProductDetails1 =catchAsyncErrors( async (req, res, next) => {
    const product1 = await Product1.findById(req.params.id);
    if (!product1) {
        return next(new ErrorHander("Product not found", 404));
    }
    res.status(200).json({
        success: true,
        product1,
    })
});


// Create New Review or Update the review
exports.createProduct1Review = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, product1Id,userId,name } = req.body;

    const review = {
        user: userId,
        name: name,
        rating: Number(rating),
        comment,
    };

    const product1 = await Product1.findById(product1Id);

    const isReviewed = product1.reviews.find(
        (rev) => rev.user.toString() === userId
    );

    if (isReviewed) {
        isReviewed.rating = rating;
    isReviewed.comment = comment;
    } else {
        product1.reviews.push(review);
    }
    product1.numOfReviews = product1.reviews.length;

    let avg = 0;

    product1.reviews.forEach((rev) => {
        avg += rev.rating;
    });

    product1.ratings = avg / product1.reviews.length;

    // await product1.save({ validateBeforeSave: false });
await product1.save();
    res.status(200).json({
        success: true,
    });
});

// Get All Reviews of a product
exports.getProduct1Reviews = catchAsyncErrors(async (req, res, next) => {
    const product1 = await Product1.findById(req.query.id);

    if (!product1) {
        return next(new ErrorHander("Product not found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product1.reviews,
    });
});

// Delete Review
exports.deleteReview1 = catchAsyncErrors(async (req, res, next) => {
    const product1 = await Product1.findById(req.query.product1Id);

    if (!product1) {
        return next(new ErrorHander("Product not found", 404));
    }

    const reviews = product1.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
    );

    let avg = 0;

    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    let ratings = 0;

    if (reviews.length === 0) {
        ratings = 0;
    } else {
        ratings = avg / reviews.length;
    }

    const numOfReviews = reviews.length;

    await Product1.findByIdAndUpdate(
        req.query.product1Id,
        {
            reviews,
            ratings,
            numOfReviews,
        },
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