# AI-Powered Intrusion Detection System With Blockchain Logging

This project is a full-stack Intrusion Detection System (IDS) that uses machine learning models to classify packet/flow data, stores detection logs in MongoDB, and optionally writes each log hash to a local blockchain smart contract.

## What Is Included

- React + Vite frontend dashboard
- Node.js + Express backend API
- MongoDB database with Mongoose models
- Session-based authentication with `express-session`
- Python `.pkl` model integration for IDS prediction
- Modular detection pipeline for manual input and future realtime packet capture
- Solidity smart contract for storing IDS log hashes
- Hardhat deployment scripts for Ganache/local blockchain

## Project Structure

```text
.
+-- AI_Detection/          # Existing ML model files: rf.pkl, xgb.pkl, features.pkl
+-- backend/               # Express API, auth, detection pipeline, MongoDB, Python bridge
+-- blockchain/            # Hardhat project and IDSLogger smart contract
+-- frontend/              # React dashboard
+-- data/                  # Dataset samples
+-- README.md              # Main execution guide
```

## Prerequisites

Install these before running the project:

- Node.js 20 recommended, Node.js 18 may work but Hardhat can show warnings
- npm
- Python 3.8+
- MongoDB Community Server or MongoDB running locally
- Ganache for local blockchain testing

Python packages required for model inference:

```bash
pip install scikit-learn xgboost
```

## 1. Install Dependencies

Open a terminal in the project root.

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

Install blockchain dependencies:

```bash
cd ../blockchain
npm install
```

## 2. Start MongoDB

Make sure MongoDB is running locally.

Default backend connection:

```text
mongodb://127.0.0.1:27017/ids_ai
```

If you installed MongoDB as a Windows service, start it from Services or run:

```powershell
net start MongoDB
```

If using MongoDB manually, start your MongoDB server before running the backend.

## 3. Configure Backend Environment

Create a `.env` file inside `backend/`.

You can copy from `backend/.env.example`.

Basic setup without blockchain:

```env
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/ids_ai
SESSION_SECRET=change-this-secret
SESSION_NAME=ids.sid
FRONTEND_ORIGIN=http://localhost:3000
PYTHON_PATH=python
MODEL_TYPE=rf
BLOCKCHAIN_ENABLED=false
BLOCKCHAIN_NETWORK=local-dev
BLOCKCHAIN_RPC_URL=http://127.0.0.1:7545
BLOCKCHAIN_PRIVATE_KEY=replace-with-ganache-private-key
IDS_LOGGER_ADDRESS=replace-with-deployed-contract-address
```

Use `BLOCKCHAIN_ENABLED=false` for first run if you only want to test login, dashboard, and detection.

## 4. Run Blockchain Locally With Ganache

This step is required only if you want IDS hashes stored on-chain.

1. Open Ganache.
2. Start a local workspace/server.
3. Confirm Ganache RPC URL is:

```text
http://127.0.0.1:7545
```

4. Copy a private key from one Ganache account.

Compile the contract:

```bash
cd blockchain
npm run compile
```

Deploy to Ganache:

```bash
npm run deploy:ganache
```

After deployment, the terminal prints:

```text
IDS_LOGGER_ADDRESS=0x...
```

Update `backend/.env`:

```env
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_NETWORK=ganache
BLOCKCHAIN_RPC_URL=http://127.0.0.1:7545
BLOCKCHAIN_PRIVATE_KEY=your-ganache-private-key
IDS_LOGGER_ADDRESS=deployed-contract-address
```

Important: keep Ganache running while the backend is running.

## 5. Start The Backend

Open a terminal:

```bash
cd backend
npm start
```

Expected output:

```text
MongoDB connected
IDS backend listening on port 3001
```

Backend health check:

```text
http://localhost:3001/health
```

## 6. Start The Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

The Vite dev server proxies `/api` requests to:

```text
http://localhost:3001
```

## 7. Use The Application

1. Open `http://localhost:3000`
2. Register a new account
3. Login if needed
4. Go to Detection
5. Submit the sample packet JSON or your own packet/flow JSON
6. The backend runs:

```text
Input Source -> Feature Processor -> AI Model -> Result -> Logger -> Blockchain
```

7. The detection log is stored in MongoDB.
8. If blockchain is enabled, the log hash is also stored in `IDSLogger`.

## 8. Admin Logs Page

The backend protects `GET /api/logs` with admin-only access.

Public registration creates normal users only for safety.

To use the Dashboard and Logs page fully, make your user an admin in MongoDB.

Example using Mongo shell:

```javascript
use ids_ai
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

Then logout and login again so the session gets the updated role.

## 9. Test The Blockchain Contract

From the blockchain folder:

```bash
cd blockchain
npm test
```

Expected result:

```text
1 passing
```

## 10. API Endpoints

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Detection:

- `POST /api/detect`
- `POST /api/realtime/ingest`

Logs:

- `POST /api/log`
- `GET /api/logs`

## 11. Common Issues

If Python prediction fails with `No module named 'sklearn'`, install:

```bash
pip install scikit-learn xgboost
```

If blockchain writes fail, check:

- Ganache is running
- `BLOCKCHAIN_ENABLED=true`
- `BLOCKCHAIN_RPC_URL` matches Ganache
- `BLOCKCHAIN_PRIVATE_KEY` is from a funded Ganache account
- `IDS_LOGGER_ADDRESS` is the deployed contract address

If Dashboard or Logs shows an admin error:

- Your account role is probably `user`
- Update the user role to `admin` in MongoDB
- Logout and login again

If Hardhat warns about Node.js:

- Install Node.js 20 LTS if possible
- Node.js 18 may still compile and test, but Hardhat can warn about support

## Recommended Terminal Layout

Use four terminals:

```text
Terminal 1: MongoDB running
Terminal 2: Ganache running
Terminal 3: backend -> npm start
Terminal 4: frontend -> npm run dev
```

For blockchain deployment, run this once before backend startup:

```bash
cd blockchain
npm run deploy:ganache
```

Then update `backend/.env` with the deployed address.

## Build Verification

Frontend production build:

```bash
cd frontend
npm run build
```

Backend syntax check:

```bash
cd backend
npm run check
```

Blockchain compile and test:

```bash
cd blockchain
npm run compile
npm test
```
