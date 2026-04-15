const path = require("path");
const { ethers } = require("ethers");

const IDS_LOGGER_ABI = require(path.resolve(__dirname, "..", "..", "blockchain", "abi", "IDSLogger.json"));

function getBlockchainConfig() {
  return {
    enabled: process.env.BLOCKCHAIN_ENABLED === "true",
    network: process.env.BLOCKCHAIN_NETWORK || "local-dev",
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:7545",
    privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY,
    contractAddress: process.env.IDS_LOGGER_ADDRESS
  };
}

function createContract(config) {
  if (!config.privateKey) {
    throw new Error("BLOCKCHAIN_PRIVATE_KEY is required when BLOCKCHAIN_ENABLED=true.");
  }

  if (!config.contractAddress) {
    throw new Error("IDS_LOGGER_ADDRESS is required when BLOCKCHAIN_ENABLED=true.");
  }

  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(config.privateKey, provider);

  return new ethers.Contract(config.contractAddress, IDS_LOGGER_ABI, wallet);
}

async function sendHash(hash) {
  const config = getBlockchainConfig();

  if (!config.enabled) {
    return {
      status: "skipped",
      network: config.network,
      hash
    };
  }

  try {
    const contract = createContract(config);
    const transaction = await contract.addLog(hash);
    const receipt = await transaction.wait();

    return {
      status: "stored",
      network: config.network,
      hash,
      contractAddress: config.contractAddress,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    return {
      status: "failed",
      network: config.network,
      hash,
      error: error.message
    };
  }
}

module.exports = { sendHash };
