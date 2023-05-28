const express = require('express');
const { getAllProducts,createProduct,updateProduct, deleteProduct, getProductDetails,createProductReview,getProductReviews,getvendorProducts,deleteReview} = require('../controllers/productController');
const {isAuthenticatedVendor, authorizeRoles1,isAuthenticatedUser, authorizeRoles}= require("../middleware/auth");

const router =express.Router();

// router.route("/products").get(getAllProducts);
// router.route("/product/new").post(isAuthenticatedVendor, createProduct);
    // router.route("/product/:id").put(isAuthenticatedVendor, updateProduct).delete(isAuthenticatedVendor, deleteProduct).get(isAuthenticatedVendor, getProductDetails);


router.route("/products").get( getAllProducts);
router.route("/vendor/products/:id").get( getvendorProducts);
router.route("/vendor/product/new").post( createProduct);
router.route("/vendor/product/:id").put( updateProduct).delete( deleteProduct);
router.route("/product/:id").get( getProductDetails);
router.route("/review").put( createProductReview);

router
    .route("/reviews")
    .get(getProductReviews)
    .delete(deleteReview);
module.exports=router;