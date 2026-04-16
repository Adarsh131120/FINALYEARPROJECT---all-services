# docs/SETUP.md

# Complete Setup Guide

## Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB 6+
- Redis 7+
- VirtualBox (for Cuckoo)
- Ubuntu 20.04/22.04 (for Cuckoo)

## Step-by-Step Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/malware-detection-system.git
cd malware-detection-system
```

### 2. Setup Cuckoo Sandbox
```bash
cd cuckoo-setup/installation-scripts
sudo ./install-cuckoo.sh
sudo ./setup-vm.sh /path/to/windows.iso
# Follow on-screen instructions
```

### 3. Train ML Models
```bash
cd ml-pipeline
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python src/train.py
cp -r saved_models/* ../ml-service/saved_models/
```

### 4. Setup ML Service
```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env
uvicorn app.main:app --reload --port 8000
```

### 5. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env
npm run dev
```

### 6. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env
npm start
```

### 7. Start All Services
```bash
chmod +x scripts/start-all.sh
./scripts/start-all.sh
```

## Verification

- Frontend: http://localhost:3000
- Backend: http://localhost:5000/health
- ML Service: http://localhost:8000/docs
- Cuckoo: http://localhost:8090

## Troubleshooting

See main README.md