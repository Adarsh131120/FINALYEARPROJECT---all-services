# docs/DEPLOYMENT.md

# Deployment Guide

## Docker Deployment

### Using Docker Compose
```bash
docker-compose up -d
```

### Individual Services
```bash
# ML Service
docker build -t ml-service ./ml-service
docker run -p 8000:8000 ml-service

# Backend
docker build -t backend ./backend
docker run -p 5000:5000 backend

# Frontend
docker build -t frontend ./frontend
docker run -p 80:80 frontend
```

## Cloud Deployment

### Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

### Render (Backend)
1. Connect GitHub repository
2. Select backend folder
3. Add environment variables
4. Deploy

### Railway (ML Service)
```bash
cd ml-service
railway login
railway init
railway up
```

## Production Checklist

- [ ] Set production environment variables
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Set up logging
- [ ] Enable rate limiting
- [ ] Secure database connections