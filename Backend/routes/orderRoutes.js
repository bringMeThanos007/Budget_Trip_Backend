const express = require("express");
const {
    newOrder,
    getSingleOrder,
    myOrders,
    getAllOrders,
    updateOrder,
    deleteOrder,
} = require("../controllers/orderController");
const router = express.Router();

const { isAuthenticatedUser,isAuthenticatedVendor,authorizeRoles1, authorizeRoles } = require("../middleware/auth");

router.route("/order/new").post( newOrder);

router.route("/order/:id").get( getSingleOrder);

router.route("/orders/:id").get(myOrders);

// router
//     .route("/admin/orders")
//     .get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

// router
//     .route("/admin/order/:id")
//     .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
//     .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);


    router
    .route("/vendor/orders/:id")
    .get(getAllOrders);

router
    .route("/vendor/order/:id")
    .put( updateOrder)
    .delete( deleteOrder);

module.exports = router;