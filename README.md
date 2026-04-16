# 🛡️ Malware Detection System

AI-powered malware detection and classification system using machine learning and behavioral analysis.

![System Architecture](docs/architecture-diagram.png)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

This project implements an intelligent malware detection system that analyzes executable files using machine learning models trained on behavioral API call sequences. The system executes suspicious files in an isolated sandbox environment (Cuckoo Sandbox), extracts runtime behavior, and classifies malware into specific families.

### Key Capabilities

- **Behavioral Analysis**: Dynamic malware analysis using API call sequences
- **ML Classification**: Random Forest and XGBoost models with 95%+ accuracy
- **Real-time Processing**: Asynchronous analysis with progress tracking
- **Web Interface**: User-friendly React frontend for file uploads and results
- **Scalable Architecture**: Microservices-based design with job queuing

---

## ✨ Features

### 🔍 Core Features

- ✅ Upload and scan executable files (.exe, .dll, .bat)
- ✅ Sandbox execution using Cuckoo Sandbox
- ✅ API call sequence extraction and preprocessing
- ✅ TF-IDF vectorization and PCA dimensionality reduction
- ✅ ML-based classification into 8 malware families:
  - Trojan
  - Worm
  - Virus
  - Backdoor
  - Spyware
  - Downloader
  - Dropper
  - Adware

### 📊 Analysis Features

- Real-time analysis status tracking
- Confidence scores and probability distributions
- Critical API call detection
- Detailed classification reports
- Analysis history and statistics dashboard

### 🚀 Technical Features

- RESTful API architecture
- Redis-based job queue (Bull)
- MongoDB for persistent storage
- Docker containerization support
- Production-ready logging and monitoring

---

## 🏗️ System Architecture


┌─────────────────┐
│  React Frontend │ (Port 3000)
│   - File Upload │
│   - Status UI   │
└────────┬────────┘
│ HTTP/REST
▼
┌─────────────────┐
│  Node.js API    │ (Port 5000)
│   - Express     │
│   - Bull Queue  │
└────────┬────────┘
│
┌────┴────┬──────────┐
▼         ▼          ▼
┌────────┐ ┌──────┐ ┌────────┐
│MongoDB │ │Redis │ │FastAPI │ (Port 8000)
│        │ │      │ │ML Svc  │
└────────┘ └──────┘ └───┬────┘
│
▼
┌──────────┐
│  Cuckoo  │ (Port 8090)
│ Sandbox  │
└──────────┘

---

## 🛠️ Tech Stack

### Frontend
- **React** 18.2 - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **React Dropzone** - File uploads

### Backend
- **Node.js** 18+ - Runtime
- **Express** - Web framework
- **Mongoose** - MongoDB ODM
- **Bull** - Job queue
- **Multer** - File upload handling

### ML Service
- **Python** 3.10+
- **FastAPI** - API framework
- **scikit-learn** - ML models
- **XGBoost** - Gradient boosting
- **joblib** - Model serialization

### Infrastructure
- **MongoDB** - Database
- **Redis** - Cache & queue
- **Cuckoo Sandbox** - Malware analysis
- **Docker** - Containerization

---

## 📦 Prerequisites

### Required Software

1. **Node.js** >= 18.0.0
```bash
   node --version
```

2. **Python** >= 3.10
```bash
   python3 --version
```

3. **MongoDB** >= 6.0
```bash
   mongod --version
```

4. **Redis** >= 7.0
```bash
   redis-server --version
```

5. **Cuckoo Sandbox** (Ubuntu VM recommended)
   - VirtualBox or VMware
   - Windows VM for malware execution

### System Requirements

- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: 50GB free space
- **OS**: Ubuntu 20.04/22.04 (for Cuckoo), Windows/Mac/Linux (for development)

---

## 🚀 Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/malware-detection-system.git
cd malware-detection-system
```

### 2. Setup Cuckoo Sandbox

Refer to [Cuckoo Setup Guide](docs/CUCKOO_SETUP.md)

```bash
cd cuckoo-setup
sudo ./installation-scripts/install-cuckoo.sh
```

### 3. Setup ML Pipeline

```bash
cd ml-pipeline

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download dataset
# Place malapi2019.csv in data/raw/

# Train models
python src/train.py

# Copy models to ML service
cp -r saved_models/* ../ml-service/saved_models/
```

### 4. Setup ML Service

```bash
cd ml-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Verify models exist
ls saved_models/

# Start service
uvicorn app.main:app --reload --port 8000
```

### 5. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration

# Create directories
mkdir -p uploads logs

# Start backend
npm run dev
```

### 6. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env
# REACT_APP_API_URL=http://localhost:5000

# Start frontend
npm start
```

---

## ⚙️ Configuration

### Backend Environment Variables

```bash
# backend/.env

PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/malware_detection
REDIS_HOST=localhost
REDIS_PORT=6379

ML_SERVICE_URL=http://localhost:8000

MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads

JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:3000
```

### ML Service Environment Variables

```bash
# ml-service/.env

CUCKOO_HOST=http://localhost:8090
MODEL_DIR=saved_models
TEMP_DIR=temp_files
LOG_LEVEL=info
```

### Frontend Environment Variables

```bash
# frontend/.env

REACT_APP_API_URL=http://localhost:5000
REACT_APP_POLL_INTERVAL=3000
```

---

## 🎮 Usage

### Starting All Services

```bash
# Use the startup script
chmod +x scripts/start-all.sh
./scripts/start-all.sh
```

Or start manually:

```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Redis
redis-server

# Terminal 3: Cuckoo
cuckoo

# Terminal 4: ML Service
cd ml-service
source venv/bin/activate
uvicorn app.main:app --port 8000

# Terminal 5: Backend
cd backend
npm run dev

# Terminal 6: Frontend
cd frontend
npm start
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **ML Service**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Uploading Files

1. Open http://localhost:3000
2. Drag & drop or click to select a file
3. Click "Analyze File"
4. Wait for analysis (2-10 minutes)
5. View results with confidence scores

---

## 📖 API Documentation

### Endpoints

#### Upload File
```http
POST /api/upload
Content-Type: multipart/form-data

Request:
- file: Binary file data

Response:
{
  "success": true,
  "taskId": "uuid-string",
  "message": "File uploaded successfully",
  "status": "queued"
}
```

#### Get Status
```http
GET /api/analysis/status/:taskId

Response:
{
  "success": true,
  "taskId": "uuid",
  "status": "completed",
  "progress": 100,
  "result": {
    "malwareFamily": "Trojan",
    "confidence": 0.95,
    "probabilities": {...},
    "totalApiCalls": 1523,
    "uniqueApiCalls": 87,
    "criticalApis": ["CreateRemoteThread", "WriteProcessMemory"]
  }
}
```

#### Get Recent Analyses
```http
GET /api/analysis/recent?page=1&limit=10

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 5,
    "limit": 10
  }
}
```

#### Get Statistics
```http
GET /api/analysis/statistics

Response:
{
  "success": true,
  "statistics": {
    "total": 100,
    "completed": 85,
    "failed": 5,
    "pending": 10,
    "familyDistribution": [...]
  }
}
```

---

## 📁 Project Structure
malware-detection-system/
├── cuckoo-setup/              # Cuckoo Sandbox setup
│   ├── installation-scripts/
│   └── configs/
│
├── ml-pipeline/               # ML model training
│   ├── data/
│   ├── src/
│   │   ├── preprocessing.py
│   │   ├── feature_engineering.py
│   │   ├── train.py
│   │   └── evaluate.py
│   ├── saved_models/
│   └── requirements.txt
│
├── ml-service/                # FastAPI ML service
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── predictor.py
│   │   ├── cuckoo_client.py
│   │   └── utils.py
│   ├── saved_models/
│   └── requirements.txt
│
├── backend/                   # Node.js backend
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/                  # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── index.js
│   └── package.json
│
├── scripts/                   # Utility scripts
│   ├── start-all.sh
│   └── stop-all.sh
│
├── docs/                      # Documentation
│   ├── API.md
│   └── SETUP.md
│
├── docker-compose.yml
├── .gitignore
└── README.md

---

## 🚢 Deployment

### Docker Deployment

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Cloud Deployment

#### Backend (Render)
1. Push to GitHub
2. Connect Render to repository
3. Set environment variables
4. Deploy

#### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

#### ML Service (Railway)
```bash
cd ml-service
railway up
```

See [Deployment Guide](docs/DEPLOYMENT.md) for details.

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### API Tests
```bash
chmod +x tests/test-api.sh
./tests/test-api.sh
```

### Integration Tests
```bash
npm run test:integration
```

---

## 🐛 Troubleshooting

### Common Issues

#### Cuckoo not starting
```bash
# Check if VM is running
VBoxManage list runningvms

# Restart Cuckoo
cuckoo clean
cuckoo
```

#### MongoDB connection error
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

#### Redis connection error
```bash
# Check Redis
redis-cli ping

# Should return: PONG
```

#### Model loading errors
```bash
# Verify models exist
ls ml-service/saved_models/

# Should show: *.pkl files
```

#### Port already in use
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

---

## 📊 Performance Metrics

- **Model Accuracy**: 95.3%
- **Average Analysis Time**: 3-5 minutes
- **API Response Time**: <200ms
- **Supported File Size**: Up to 50MB
- **Concurrent Analyses**: 10+ (configurable)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

---

## 👥 Authors

- **Adarsh Tiwari** - B122006
- **Liron Sarangi** - B122065
- **Anushka Joshi** - B122022

**Supervisor**: Dr. Sabyasachi Patra

**Institution**: International Institute of Information Technology, Bhubaneswar

---

## 📚 References

1. Catak, F. O., et al. (2021). Mal-API-2019 Dataset
2. Ucci, D., et al. (2019). Survey on Malware Analysis Techniques
3. Cuckoo Sandbox Documentation
4. scikit-learn Documentation

---

## 🙏 Acknowledgments

- Cuckoo Sandbox team
- Mal-API-2019 dataset creators
- Open source community
- IIIT Bhubaneswar

---

## 📞 Contact

For questions or support:
- Email: your.email@example.com
- GitHub Issues: [Create Issue](https://github.com/yourusername/malware-detection-system/issues)

---

## 🔮 Future Enhancements

- [ ] Support for more file types (PDF, Office docs)
- [ ] LSTM/GRU models for sequence analysis
- [ ] Real-time threat intelligence integration
- [ ] Multi-language support
- [ ] Advanced reporting and analytics
- [ ] API rate limiting and authentication
- [ ] Automated model retraining pipeline

---

**⚠️ Disclaimer**: This tool is for educational and research purposes only. Always handle malware samples with extreme caution in isolated environments.

**🛡️ Security Notice**: Never execute malware outside of a controlled sandbox environment.

---

Made with ❤️ for Cybersecurity Research