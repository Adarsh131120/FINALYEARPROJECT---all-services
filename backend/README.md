# backend/README.md

# Malware Detection Backend

Node.js Express backend for malware detection system.

## Setup

```bash
npm install
```

## Configuration

Create `.env` file:

PORT=5000
MONGODB_URI=mongodb://localhost:27017/malware_detection
REDIS_HOST=localhost
ML_SERVICE_URL=http://localhost:8000

## Database Setup

```bash
# Start MongoDB
sudo systemctl start mongod

# Start Redis
redis-server
```

## Run

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

- `POST /api/upload` - Upload file
- `GET /api/analysis/status/:taskId` - Get status
- `GET /api/analysis/result/:taskId` - Get result
- `GET /api/analysis/recent` - Get recent analyses
- `GET /api/analysis/statistics` - Get statistics

## Testing

```bash
npm test
```