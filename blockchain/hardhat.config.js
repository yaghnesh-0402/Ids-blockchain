require("@nomicfoundation/hardhat-ethers");

module.exports = {
  solidity: "0.8.24",
  networks: {
    localhost: {
      url: process.env.LOCALHOST_RPC_URL || "http://127.0.0.1:8545"
    },
    ganache: {
      url: process.env.GANACHE_RPC_URL || "http://127.0.0.1:7545"
    }
  }
};
