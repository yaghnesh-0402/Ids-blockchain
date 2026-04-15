const featureProcessor = require("../services/featureProcessor");
const aiService = require("../services/aiService");
const logService = require("../services/logService");
const blockchainService = require("../services/blockchainService");

async function processDetection(inputData, options = {}) {
  const source = options.source || "manual";
  const featureResult = featureProcessor.process(inputData, { source });
  const predictionResult = await aiService.runPrediction(featureResult.processedData, {
    modelType: options.modelType
  });

  const logRecord = await logService.createLog({
    source,
    rawData: inputData,
    processedData: featureResult.processedData,
    prediction: String(predictionResult.prediction),
    confidence: predictionResult.confidence,
    createdBy: options.userId || null
  });

  const blockchainReceipt = await blockchainService.sendHash(logRecord.hash);

  if (blockchainReceipt) {
    logRecord.blockchainReceipt = blockchainReceipt;
    await logRecord.save();
  }

  return {
    source,
    featureNames: featureResult.featureNames,
    missingFields: featureResult.missingFields,
    processedData: featureResult.processedData,
    prediction: predictionResult.prediction,
    confidence: predictionResult.confidence,
    modelType: predictionResult.modelType,
    hash: logRecord.hash,
    blockchain: blockchainReceipt,
    logId: logRecord._id
  };
}

module.exports = { processDetection };
