#!/bin/bash
# scripts/deploy.sh

echo "🚀 Deploying Malware Detection System"

# Check if required tools are installed
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed."; exit 1; }

# Build and push Docker images
echo "Building Docker images..."

# ML Service
docker build -t malware-ml-service:latest ./ml-service
docker tag malware-ml-service:latest yourusername/malware-ml-service:latest
docker push yourusername/malware-ml-service:latest

# Backend
docker build -t malware-backend:latest ./backend
docker tag malware-backend:latest yourusername/malware-backend:latest
docker push yourusername/malware-backend:latest

# Frontend
docker build -t malware-frontend:latest ./frontend
docker tag malware-frontend:latest yourusername/malware-frontend:latest
docker push yourusername/malware-frontend:latest

echo "✅ All images built and pushed!"

# Deploy to cloud (example for Railway)
echo "Deploying services..."

cd ml-service && railway up
cd ../backend && railway up
cd ../frontend && vercel --prod

echo "✅ Deployment complete!"