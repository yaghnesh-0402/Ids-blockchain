const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  source: {
    type: String,
    enum: ["manual", "realtime"],
    default: "manual"
  },
  rawData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  processedData: {
    type: [Number],
    required: true
  },
  prediction: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  hash: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  blockchainReceipt: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
});

module.exports = mongoose.model("Log", logSchema);
