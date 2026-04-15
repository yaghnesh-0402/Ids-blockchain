const path = require("path");
const { spawn } = require("child_process");

const ROOT_DIR = path.resolve(__dirname, "..", "..");
const SCRIPT_PATH = path.join(__dirname, "..", "scripts", "predict.py");

function runPrediction(processedData, options = {}) {
  const pythonPath = process.env.PYTHON_PATH || "python";
  const modelType = options.modelType || process.env.MODEL_TYPE || "rf";

  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      modelType,
      features: processedData,
      modelsDir: path.join(ROOT_DIR, "AI_Detection")
    });

    const pythonProcess = spawn(pythonPath, [SCRIPT_PATH], {
      cwd: ROOT_DIR,
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    pythonProcess.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    pythonProcess.on("error", (error) => {
      reject(new Error(`Unable to start Python process: ${error.message}`));
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `Python process exited with code ${code}.`));
        return;
      }

      try {
        resolve(JSON.parse(stdout));
      } catch (error) {
        reject(new Error(`Invalid AI response: ${error.message}`));
      }
    });

    pythonProcess.stdin.write(payload);
    pythonProcess.stdin.end();
  });
}

module.exports = { runPrediction };
