const express = require("express");
const detectionController = require("../controllers/detectionController");
const { isAuthenticated } = require("../middleware/isAuthenticated");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/detect", isAuthenticated, asyncHandler(detectionController.detect));

module.exports = router;
