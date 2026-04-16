#!/bin/bash
# scripts/stop-all.sh

echo "Stopping all services..."

# Kill ML Service
if [ -f .pids/ml-service.pid ]; then
    kill $(cat .pids/ml-service.pid) 2>/dev/null
    rm .pids/ml-service.pid
    echo "✓ ML Service stopped"
fi

# Kill Backend
if [ -f .pids/backend.pid ]; then
    kill $(cat .pids/backend.pid) 2>/dev/null
    rm .pids/backend.pid
    echo "✓ Backend stopped"
fi

# Kill Frontend
if [ -f .pids/frontend.pid ]; then
    kill $(cat .pids/frontend.pid) 2>/dev/null
    rm .pids/frontend.pid
    echo "✓ Frontend stopped"
fi

echo "All services stopped"