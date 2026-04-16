#!/bin/bash
# scripts/start-all.sh

echo "========================================="
echo "  Malware Detection System Startup"
echo "========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo -e "${YELLOW}Checking MongoDB...${NC}"
if ! pgrep -x "mongod" > /dev/null; then
    echo -e "${RED}✗ MongoDB not running. Starting...${NC}"
    mongod --fork --logpath /var/log/mongodb.log
else
    echo -e "${GREEN}✓ MongoDB running${NC}"
fi

# Check if Redis is running
echo -e "${YELLOW}Checking Redis...${NC}"
if ! pgrep -x "redis-server" > /dev/null; then
    echo -e "${RED}✗ Redis not running. Starting...${NC}"
    redis-server --daemonize yes
else
    echo -e "${GREEN}✓ Redis running${NC}"
fi

# Start ML Service (FastAPI)
echo -e "${YELLOW}Starting ML Service...${NC}"
cd ml-service
source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > logs/ml-service.log 2>&1 &
ML_PID=$!
echo -e "${GREEN}✓ ML Service started (PID: $ML_PID)${NC}"
cd ..

# Wait for ML service to start
sleep 5

# Start Backend (Node.js)
echo -e "${YELLOW}Starting Backend...${NC}"
cd backend
npm install > /dev/null 2>&1
nohup npm start > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
cd ..

# Wait for backend to start
sleep 5

# Start Frontend (React)
echo -e "${YELLOW}Starting Frontend...${NC}"
cd frontend
npm install > /dev/null 2>&1
nohup npm start > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
cd ..

echo ""
echo "========================================="
echo -e "${GREEN}All services started successfully!${NC}"
echo "========================================="
echo ""
echo "Services:"
echo "  - ML Service:  http://localhost:8000"
echo "  - Backend API: http://localhost:5000"
echo "  - Frontend:    http://localhost:3000"
echo ""
echo "Process IDs:"
echo "  - ML Service: $ML_PID"
echo "  - Backend:    $BACKEND_PID"
echo "  - Frontend:   $FRONTEND_PID"
echo ""
echo "To stop all services, run: ./scripts/stop-all.sh"
echo "========================================="

# Save PIDs
echo "$ML_PID" > .pids/ml-service.pid
echo "$BACKEND_PID" > .pids/backend.pid
echo "$FRONTEND_PID" > .pids/frontend.pid