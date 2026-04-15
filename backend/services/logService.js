const Log = require("../models/Log");
const { sha256 } = require("../utils/hash");

function buildHashPayload(logData) {
  return JSON.stringify({
    rawData: logData.rawData,
    processedData: logData.processedData,
    prediction: logData.prediction,
    confidence: logData.confidence,
    timestamp: logData.timestamp,
    source: logData.source
  });
}

async function createLog(logData) {
  const timestamp = logData.timestamp || new Date();
  const hash = sha256(buildHashPayload({ ...logData, timestamp }));

  const log = await Log.create({
    ...logData,
    timestamp,
    hash
  });

  return log;
}

async function getAllLogs() {
  return Log.find().sort({ timestamp: -1 }).populate("createdBy", "username email role");
}

module.exports = { createLog, getAllLogs };
