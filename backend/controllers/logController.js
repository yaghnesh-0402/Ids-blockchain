const logService = require("../services/logService");

async function createLog(req, res) {
  const { rawData, processedData, prediction, confidence, source, timestamp } = req.body;

  if (!rawData || !Array.isArray(processedData) || !prediction) {
    return res.status(400).json({
      message: "rawData, processedData, and prediction are required."
    });
  }

  const log = await logService.createLog({
    rawData,
    processedData,
    prediction,
    confidence,
    source: source === "realtime" ? "realtime" : "manual",
    timestamp: timestamp ? new Date(timestamp) : new Date(),
    createdBy: req.session.user.id
  });

  return res.status(201).json(log);
}

async function getLogs(req, res) {
  const logs = await logService.getAllLogs();
  return res.json(logs);
}

module.exports = { createLog, getLogs };
