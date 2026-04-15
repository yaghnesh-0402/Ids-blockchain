const { processDetection } = require("../pipelines/detectionPipeline");

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
    userId: req.session.user.id
  });

  return res.status(202).json({
    message: "Realtime ingest hook is prepared. Packet capture can post payloads here later.",
    result
  });
}

module.exports = { detect, ingestRealtime };
