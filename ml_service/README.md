# ml-service/README.md

# ML Microservice

FastAPI service for malware classification using trained ML models.

## Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Ensure Models Exist

```bash
ls saved_models/
# Should show: *.pkl files
```

## Run Service

```bash
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

- `GET /` - Health check
- `POST /api/upload` - Upload file for analysis
- `GET /api/status/{task_id}` - Get analysis status
- `POST /api/predict` - Direct prediction from API sequence
- `GET /api/models` - Get model information

## Docs

Interactive API docs: http://localhost:8000/docs