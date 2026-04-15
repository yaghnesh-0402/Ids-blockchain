# IDS Backend

Express + MongoDB backend for the AI-powered IDS workflow.

## Structure

- `controllers/` request handlers
- `routes/` API routes
- `models/` Mongoose schemas
- `middleware/` auth guards
- `services/` reusable processing services
- `pipelines/` shared detection flow for manual and future realtime input
- `scripts/predict.py` Python bridge for `.pkl` models

## Setup

1. Copy `.env.example` to `.env`
2. Install Node packages:
   `npm install`
3. Install Python ML packages used by the pickles:
   `pip install scikit-learn xgboost`
4. Start MongoDB
5. Run the API:
   `npm start`

## Main Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/detect`
- `POST /api/realtime/ingest`
- `POST /api/log`
- `GET /api/logs`

## Notes

- `POST /api/detect` and `POST /api/realtime/ingest` both use `pipelines/detectionPipeline.js`
- Public registration always creates a normal `user`; create admins manually in MongoDB or with a seed script later
- Blockchain submission is enabled with `BLOCKCHAIN_ENABLED=true`, `BLOCKCHAIN_RPC_URL`, `BLOCKCHAIN_PRIVATE_KEY`, and `IDS_LOGGER_ADDRESS`
