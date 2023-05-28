const express = require("express");
const {
    registerUser,
    loginUser,
    logout,
    forgotPassword,
    resetPassword,
    getUserDetails,
    updatePassword,
    updateProfile,
    getAllUser,
    getSingleUser,
    updateUserRole,
    deleteUser,
    saveRequest
} = require("../controllers/userController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router = express.Router();


router.route("/register").post(registerUser);

router.route("/login").post(loginUser);
router.route("/requests").post(saveRequest);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

router.route("/logout").get(logout);

router.route("/user/:_id").get( getUserDetails);

router.route("/password/update/:userId").put(updatePassword);

router.route("/updateup/:userId").put(updateProfile);

router
    .route("/admin/users")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUser);

router
    .route("/admin/user/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
//     .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

module.exports = router;