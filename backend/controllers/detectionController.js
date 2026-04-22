const { processDetection } = require("../pipelines/detectionPipeline");
const realtimeCaptureService = require("../services/realtimeCaptureService");

async function detect(req, res) {
  const result = await processDetection(req.body, {
    source: "manual",
    modelType: req.body.modelType,
    userId: req.session.user.id
  });

  return res.json(result);
}

async function ingestRealtime(req, res) {
  const result = await processDetection(req.body, {
    source: "realtime",
    modelType: req.body.modelType,
    userId: req.session.user.id,
    shouldStoreOnBlockchain: (predictionResult) => String(predictionResult.prediction) === "1"
  });

  return res.status(202).json({
    message: "Realtime ingest hook is prepared. Packet capture can post payloads here later.",
    result
  });
}

async function startRealtimeCapture(req, res) {
  const status = await realtimeCaptureService.startCapture({
    modelType: req.body.modelType,
    interfaceName: req.body.interfaceName,
    filter: req.body.filter,
    windowSeconds: req.body.windowSeconds
  });

  return res.status(202).json({
    message: "Realtime capture started.",
    status
  });
}

async function stopRealtimeCapture(req, res) {
  const status = await realtimeCaptureService.stopCapture();

  return res.json({
    message: "Realtime capture stopped.",
    status
  });
}

function getRealtimeStatus(req, res) {
  return res.json(realtimeCaptureService.getStatus());
}

function getRealtimeEvents(req, res) {
  return res.json(realtimeCaptureService.getRecentEvents());
}

module.exports = {
  detect,
  ingestRealtime,
  startRealtimeCapture,
  stopRealtimeCapture,
  getRealtimeStatus,
  getRealtimeEvents
};
