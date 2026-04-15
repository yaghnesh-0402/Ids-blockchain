# IDS Blockchain Module

Simple Hardhat module for storing IDS log hashes on a local chain such as Ganache.

## Contract

`contracts/IDSLogger.sol`

- `addLog(string memory _hash)`
- `getLog(uint256 index)`
- `getAllLogs()`

Each log stores:

- `dataHash`
- `timestamp`

## Setup

```bash
npm install
npm run compile
```

## Deploy To Ganache

Start Ganache on `http://127.0.0.1:7545`, then run:

```bash
npm run deploy:ganache
```

The deploy script writes deployment metadata to `deployments/` and prints the address for `backend/.env`.

## Backend Environment

```env
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_NETWORK=ganache
BLOCKCHAIN_RPC_URL=http://127.0.0.1:7545
BLOCKCHAIN_PRIVATE_KEY=replace-with-ganache-private-key
IDS_LOGGER_ADDRESS=replace-with-deployed-contract-address
```

The backend pipeline already calls:

`detectionPipeline -> logService -> blockchainService`
