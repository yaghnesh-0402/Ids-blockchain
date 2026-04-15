const express = require("express");
const logController = require("../controllers/logController");
const { isAuthenticated } = require("../middleware/isAuthenticated");
const { isAdmin } = require("../middleware/isAdmin");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/log", isAuthenticated, asyncHandler(logController.createLog));
router.get("/logs", isAdmin, asyncHandler(logController.getLogs));

module.exports = router;
