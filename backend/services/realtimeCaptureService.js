const path = require("path");
const { spawn } = require("child_process");
const { processDetection } = require("../pipelines/detectionPipeline");

const ROOT_DIR = path.resolve(__dirname, "..", "..");
const SCRIPT_PATH = path.join(__dirname, "..", "scripts", "realtime_sniffer.py");
const MAX_EVENTS = Number(process.env.REALTIME_MAX_EVENTS || 50);

const state = {
  running: false,
  startedAt: null,
  stoppedAt: null,
  lastError: null,
  modelType: null,
  interfaceName: null,
  filter: null,
  windowSeconds: null,
  packetsSeen: 0,
  flowsProcessed: 0,
  suspiciousCount: 0,
  recentEvents: [],
  process: null
};

function pushEvent(event) {
  state.recentEvents = [event, ...state.recentEvents].slice(0, MAX_EVENTS);
}

function getStatus() {
  return {
    running: state.running,
    startedAt: state.startedAt,
    stoppedAt: state.stoppedAt,
    lastError: state.lastError,
    modelType: state.modelType,
    interfaceName: state.interfaceName,
    filter: state.filter,
    windowSeconds: state.windowSeconds,
    packetsSeen: state.packetsSeen,
    flowsProcessed: state.flowsProcessed,
    suspiciousCount: state.suspiciousCount,
    recentEvents: state.recentEvents
  };
}

function getRecentEvents() {
  return state.recentEvents;
}

function handleCaptureMessage(message) {
  if (message.type === "status") {
    state.packetsSeen = message.packetsSeen ?? state.packetsSeen;
    return;
  }

  if (message.type !== "flow") {
    return;
  }

  state.flowsProcessed += 1;

  processDetection(message.features, {
    source: "realtime",
    modelType: state.modelType || "ensemble",
    rawData: {
      flow: message.flow,
      packetsSeen: message.packetsSeen,
      captureWindow: message.captureWindow,
      packets: message.packetPreview,
      computedFeatures: message.features
    },
    shouldStoreOnBlockchain: (predictionResult) => String(predictionResult.prediction) === "1"
  })
    .then((result) => {
      const suspicious = String(result.prediction) === "1";
      if (suspicious) {
        state.suspiciousCount += 1;
      }

      pushEvent({
        id: `${Date.now()}-${state.flowsProcessed}`,
        timestamp: new Date().toISOString(),
        source: `${message.flow.src}:${message.flow.sport} -> ${message.flow.dst}:${message.flow.dport}`,
        protocol: message.flow.protocol,
        packetsSeen: message.packetsSeen,
        flowDurationMs: message.flow.durationMs,
        prediction: result.prediction,
        confidence: result.confidence,
        modelType: result.modelType,
        suspicious,
        blockchain: result.blockchain,
        votes: result.votes,
        individualModels: result.individualModels,
        hash: result.hash,
        logId: result.logId
      });
    })
    .catch((error) => {
      state.lastError = error.message;
      pushEvent({
        id: `${Date.now()}-${state.flowsProcessed}`,
        timestamp: new Date().toISOString(),
        source: `${message.flow.src}:${message.flow.sport} -> ${message.flow.dst}:${message.flow.dport}`,
        protocol: message.flow.protocol,
        packetsSeen: message.packetsSeen,
        prediction: "error",
        confidence: null,
        suspicious: false,
        error: error.message
      });
    });
}

async function startCapture(options = {}) {
  if (state.running) {
    return getStatus();
  }

  const pythonPath = process.env.PYTHON_PATH || "python";
  const modelType = options.modelType || process.env.REALTIME_MODEL_TYPE || process.env.MODEL_TYPE || "ensemble";
  const interfaceName = options.interfaceName || process.env.REALTIME_CAPTURE_INTERFACE || "";
  const filter = options.filter || process.env.REALTIME_CAPTURE_FILTER || "";
  const windowSeconds = Number(options.windowSeconds || process.env.REALTIME_CAPTURE_WINDOW_SECONDS || 30);

  const captureProcess = spawn(
    pythonPath,
    [
      SCRIPT_PATH,
      "--window-seconds",
      String(windowSeconds),
      "--interface",
      interfaceName,
      "--filter",
      filter
    ],
    {
      cwd: ROOT_DIR,
      stdio: ["ignore", "pipe", "pipe"]
    }
  );

  state.running = true;
  state.startedAt = new Date().toISOString();
  state.stoppedAt = null;
  state.lastError = null;
  state.modelType = modelType;
  state.interfaceName = interfaceName || "default";
  state.filter = filter || "all";
  state.windowSeconds = windowSeconds;
  state.packetsSeen = 0;
  state.flowsProcessed = 0;
  state.suspiciousCount = 0;
  state.recentEvents = [];
  state.process = captureProcess;

  let stdoutBuffer = "";
  captureProcess.stdout.on("data", (chunk) => {
    stdoutBuffer += chunk.toString();
    const lines = stdoutBuffer.split(/\r?\n/);
    stdoutBuffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }

      try {
        handleCaptureMessage(JSON.parse(trimmed));
      } catch (error) {
        state.lastError = `Unable to parse realtime capture message: ${error.message}`;
      }
    }
  });

  captureProcess.stderr.on("data", (chunk) => {
    const message = chunk.toString().trim();
    if (message) {
      state.lastError = message;
    }
  });

  captureProcess.on("error", (error) => {
    state.lastError = error.message;
    state.running = false;
    state.process = null;
    state.stoppedAt = new Date().toISOString();
  });

  captureProcess.on("close", () => {
    state.running = false;
    state.process = null;
    state.stoppedAt = new Date().toISOString();
  });

  return getStatus();
}

async function stopCapture() {
  if (state.process) {
    state.process.kill();
  }

  state.running = false;
  state.process = null;
  state.stoppedAt = new Date().toISOString();
  return getStatus();
}

module.exports = {
  getRecentEvents,
  getStatus,
  startCapture,
  stopCapture
};
