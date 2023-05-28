const express = require("express");
const {
    registerVendor,
    loginVendor,
    logoutVendor,
    forgotPassword1,
    resetPassword1,
    getVendorDetails,
    updatePasswordv,
    updateProfile1,
    getAllVendor,
    getSingleVendor,
    updateVendorRole,
    deleteVendor,
} = require("../controllers/vendorController");
const { isAuthenticatedVendor, authorizeRoles1 } = require("../middleware/auth");

const router = express.Router();

router.route("/registerv").post(registerVendor);

router.route("/loginv").post(loginVendor);

router.route("/password/forgotv").post(forgotPassword1);

router.route("/password/resetv/:token1").put(resetPassword1);

router.route("/logoutvendor").get(logoutVendor);

router.route("/vendor/:_id").get( getVendorDetails);

router.route("/password/updatev/:vendorId").put(updatePasswordv);

router.route("/updatevp/:vendorId").put(updateProfile1);

router
    .route("/admin/vendors")
    .get(isAuthenticatedVendor, authorizeRoles1("admin"), getAllVendor);

router
    .route("/admin/vendor/:id")
    .get(isAuthenticatedVendor, authorizeRoles1("admin"), getSingleVendor)
//     .put(isAuthenticatedVendor, authorizeRoles1("admin"), updateVendorRole)
    .delete(isAuthenticatedVendor, authorizeRoles1("admin"), deleteVendor);

module.exports = router;