const mongoose = require("mongoose");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Product = require("../models/productModel");
const ErrorHander = require("../utils/errorhander");

const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary");

const { createReadStream } = require("fs");
const { pipeline } = require("stream");
const { promisify } = require("util");
const pipelineAsync = promisify(pipeline);

//create product - hotel vendor
// exports.createProduct = catchAsyncErrors(async (req, res, next) => {
//     //  console.log("Request Body:", req.body);
//     let images = [];

//     if (typeof req.body.images === "string") {
//         images.push(req.body.images);
//     } else {
//         images = req.body.images;
//     }

//     const imagesLinks = [];

//     for (let i = 0; i < images.length; i++) {
//         const result = await cloudinary.v2.uploader.upload(images[i], {
//             folder: "products",
//         });

//         imagesLinks.push({
//             public_id: result.public_id,
//             url: result.secure_url,
//         });
//     }

//     req.body.images = imagesLinks;
  
//     // req.body.vendor = req.vendor.id;
   

//    const roomtypeData = JSON.parse(req.body.roomtype);
// const amenitydata = JSON.parse(req.body.amenities);
//    // Create a new product with the parsed roomtype
//    const product = new Product({
//      name: req.body.name,
//      description: req.body.description,
//      address: req.body.address,
//      city: req.body.city,
//      state: req.body.state,
//      nearby: req.body.nearby,
//      price: req.body.price,
//      roomtype: roomtypeData,
//      ammeneties: amenitydata,
//      Category: req.body.Category,
//      Stock: req.body.Stock,
//      vendor: req.body.vendor,
//      // Rest of the properties...
//    });

//    // Save the product to the database
//    await product.save();
//     res.status(201).json({
//         success: true,
//         product,
//     });
// });
exports.createProduct = async (req, res) => {
  try {
   
    const roomtypeData = JSON.parse(req.body.roomtype);
    const amenityData = JSON.parse(req.body.amenities);

   let images = [];

   
        if (typeof req.body.images === "string") {
            images.push(req.body.images);
        } else {
            images = req.body.images;
        }

        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }

        req.body.images = imagesLinks;
    // Create a new product with the parsed roomtype
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      nearby: req.body.nearby,
      price: req.body.price,
      roomtype: roomtypeData,
      ammeneties: amenityData,
      images: imagesLinks,
      Category: req.body.Category,
      Stock: req.body.Stock,
      vendor: req.body.vendor,
      // Rest of the properties...
    });

    // Save the product to the database
    await product.save();


    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


//get all product
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
    // const resultPerPage = 8;
    const productsCount = await Product.countDocuments();

    const apiFeature = new ApiFeatures(Product.find(),req.query)
    .search()
    .filter();
    // .pagination(resultPerPage);

    const products = await apiFeature.query;
    const filteredProductsCount = products.length;
    // let products = await apiFeature.query;

    // let filteredProductsCount = products.length;
    // if (filteredProductsCount > resultPerPage) {
    //     filteredProductsCount = Math.min(
    //         filteredProductsCount,
    //         (currentPage * resultPerPage)
    //     );
    // }
    // apiFeature.pagination(resultPerPage);

    // products = await apiFeature.query;

    // const products = await Product.find();
    // let filteredProductsCount = await Product.find();
    // if (req.query.keyword) {
    //     filteredProductsCount = filteredProductsCount.filter(product =>
    //         product.name.toUpperCase().includes(req.query.keyword.toUpperCase())
    //     );
    // }
    // filteredProductsCount = filteredProductsCount.length;

    res.status(200).json({
        success: true, 
        // count: products.length,
       products,
        productsCount,
        // resultPerPage,
        filteredProductsCount,
    });
});

// Get All Product (hotelvendor)
exports.getvendorProducts = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const vproducts = await Product.find({ vendor: id });

  const totalProducts = vproducts.length;

  res.status(200).json({
    success: true,
    totalProducts,
    vproducts,
  });
});


//update hotel - hotel vendor

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }

    // Images Start Here
   

        let images = [];
        
        if (typeof req.body.images === "string") {
            images.push(req.body.images);
        } else {
            images = req.body.images;
        }
        
        if (images !== undefined) {
            // Deleting Images From Cloudinary
            for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }
        
        const imagesLinks = [];
        
        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }
        
        req.body.images = imagesLinks;
    }
    

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        product,
    });
});
// //delete hotel (product) by hotel vendor
exports.deleteProduct = catchAsyncErrors( async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }
    await product.remove();
    res.status(200).json({
        success:true,
        message:"deleted successfully"
    })

})

// //Get hotel(product) details on opening
exports.getProductDetails = catchAsyncErrors( async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }
    res.status(200).json({
        success: true,
        product,
    })
})


// // Create New Review or Update the review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId, userId, name } = req.body;

  const review = {
    user: userId,
    name: name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === userId
  );

  if (isReviewed) {
    isReviewed.rating = rating;
    isReviewed.comment = comment;
  } else {
    product.reviews.push(review);
  }

  product.numOfReviews = product.reviews.length;

  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save();

  res.status(200).json({
    success: true,
  });
});


// // Get All Reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});

// // Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }

    const reviews = product.reviews.filter(
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

    await Product.findByIdAndUpdate(
        req.query.productId,
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