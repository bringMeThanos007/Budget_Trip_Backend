const express = require("express");
const router = express.Router();
const { saveRequest , getRequest } = require("../controllers/userController");

// POST /api/v1/requests
router.post("/requests", saveRequest);
router.get("/requests1", getRequest);

module.exports = router;
