const express = require("express");
const detectionController = require("../controllers/detectionController");
const { isAuthenticated } = require("../middleware/isAuthenticated");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/realtime/ingest", isAuthenticated, asyncHandler(detectionController.ingestRealtime));
router.post("/realtime/start", isAuthenticated, asyncHandler(detectionController.startRealtimeCapture));
router.post("/realtime/stop", isAuthenticated, asyncHandler(detectionController.stopRealtimeCapture));
router.get("/realtime/status", isAuthenticated, detectionController.getRealtimeStatus);
router.get("/realtime/events", isAuthenticated, detectionController.getRealtimeEvents);

module.exports = router;
