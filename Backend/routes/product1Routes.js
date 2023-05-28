const express = require('express');
const { getAllProducts1, createProduct1, updateProduct1, getvendorProducts1, deleteProduct1, getProductDetails1, createProduct1Review, getProduct1Reviews, deleteReview1 } = require('../controllers/product1Controller');
const { isAuthenticatedVendor, authorizeRoles1, isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/products1").get(getAllProducts1);
router.route("/vendor/products1/:id").get(getvendorProducts1);

router.route("/vendor/product1/new").post( createProduct1);
router.route("/vendor/product1/:id").put(updateProduct1).delete( deleteProduct1);
router.route("/product1/:id").get(getProductDetails1);
router.route("/review1").put( createProduct1Review);
router
    .route("/reviews1")
    .get(getProduct1Reviews)
    .delete(deleteReview1);
// router.route("/product1/:id").put(updateProduct1).delete(deleteProduct1).get(getProductDetails1);

module.exports = router;