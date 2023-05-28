const express = require("express");
const {
    registerGuide,
    loginGuide,
    logoutGuide,
    forgotPassword2,
    resetPassword2,
    getGuideDetails,
    updatePasswordg,
    updateProfile2,
    getAllGuide,
    getSingleGuide,
    updateGuideRole,
    deleteGuide,
} = require("../controllers/guideController");
const { isAuthenticatedGuide, authorizeRoles2,authorizeRoles1 } = require("../middleware/auth");

const router = express.Router();

router.route("/registerg").post(registerGuide);

router.route("/loging").post(loginGuide);

router.route("/password/forgotg").post(forgotPassword2);

router.route("/password/resetg/:token2").put(resetPassword2);

router.route("/logoutguide").get(logoutGuide);

router.route("/guide/:_id").get(getGuideDetails);

router.route("/password/updateg/:guideId").put(updatePasswordg);

router.route("/updategp/:guideId").put(updateProfile2);

router
    .route("/guides")
    .get(getAllGuide);

router
    .route("/admin/guide/:id")
    .get(isAuthenticatedGuide, authorizeRoles2("admin"), getSingleGuide)
    //     .put(isAuthenticatedGuide, authorizeRoles1("admin"), updateGuideRole)
    .delete(isAuthenticatedGuide, authorizeRoles2("admin"), deleteGuide);

module.exports = router;