# docs/API.md

# API Documentation

## Base URL
http://localhost:5000/api

## Endpoints

### Upload File
```http
POST /upload
Content-Type: multipart/form-data

Body:
- file: Binary file data

Response: 200 OK
{
  "success": true,
  "taskId": "uuid-string",
  "message": "File uploaded successfully",
  "status": "queued"
}
```

### Get Analysis Status
```http
GET /analysis/status/:taskId

Response: 200 OK
{
  "success": true,
  "taskId": "uuid",
  "status": "completed|pending|analyzing|failed",
  "progress": 100,
  "filename": "malware.exe",
  "result": { ... },
  "createdAt": "2025-01-01T00:00:00.000Z",
  "completedAt": "2025-01-01T00:05:00.000Z"
}
```

### Get Analysis Result
```http
GET /analysis/result/:taskId

Response: 200 OK
{
  "success": true,
  "taskId": "uuid",
  "filename": "malware.exe",
  "result": {
    "malwareFamily": "Trojan",
    "confidence": 0.95,
    "probabilities": {
      "Trojan": 0.95,
      "Worm": 0.03,
      ...
    },
    "totalApiCalls": 1523,
    "uniqueApiCalls": 87,
    "criticalApis": ["CreateRemoteThread", ...]
  },
  "processingTime": 245,
  "completedAt": "2025-01-01T00:05:00.000Z"
}
```

### Get Recent Analyses
```http
GET /analysis/recent?page=1&limit=10

Response: 200 OK
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

### Get Statistics
```http
GET /analysis/statistics

Response: 200 OK
{
  "success": true,
  "statistics": {
    "total": 100,
    "completed": 85,
    "failed": 5,
    "pending": 10,
    "familyDistribution": [
      { "_id": "Trojan", "count": 30 },
      ...
    ],
    "averageProcessingTime": 180
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid file type"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Analysis not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```