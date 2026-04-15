const express = require("express");
const detectionController = require("../controllers/detectionController");
const { isAuthenticated } = require("../middleware/isAuthenticated");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/realtime/ingest", isAuthenticated, asyncHandler(detectionController.ingestRealtime));

module.exports = router;
