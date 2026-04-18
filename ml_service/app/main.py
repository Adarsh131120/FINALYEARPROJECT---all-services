# # ml-service/app/main.py (add caching)

# from functools import lru_cache
# import hashlib

# class MalwarePredictor:
#     def __init__(self):
#         self.cache = {}
    
#     def predict_with_cache(self, api_sequence: str):
#         # Generate hash of API sequence
#         seq_hash = hashlib.md5(api_sequence.encode()).hexdigest()
        
#         # Check cache
#         if seq_hash in self.cache:
#             print(f"Cache hit for {seq_hash}")
#             return self.cache[seq_hash]
        
#         # Predict
#         result = self.predict(api_sequence)
        
#         # Cache result
#         self.cache[seq_hash] = result
        
#         return result


# ml-service/app/main.py

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
from typing import Optional
import logging

from .models import (
    PredictionRequest, 
    PredictionResponse,
    UploadResponse,
    StatusResponse,
    AnalysisStatus
)
from .predictor import MalwarePredictor
from .cuckoo_client import CuckooClient

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Malware Detection ML Service",
    description="Machine Learning service for malware classification using API call sequences",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
MODEL_DIR = os.getenv("MODEL_DIR", "saved_models")
TEMP_DIR = os.getenv("TEMP_DIR", "temp_files")
CUCKOO_HOST = os.getenv("CUCKOO_HOST", "http://localhost:8090")

# Ensure temp directory exists
os.makedirs(TEMP_DIR, exist_ok=True)

# Initialize predictor and Cuckoo client
try:
    predictor = MalwarePredictor(model_dir=MODEL_DIR)
    logger.info("✓ ML Predictor initialized successfully")
except Exception as e:
    logger.error(f"✗ Failed to initialize predictor: {e}")
    predictor = None

try:
    cuckoo = CuckooClient(host=CUCKOO_HOST)
    logger.info("✓ Cuckoo client initialized")
except Exception as e:
    logger.warning(f"⚠ Cuckoo client initialization warning: {e}")
    cuckoo = None

# In-memory task storage (use Redis in production)
analysis_tasks = {}


@app.on_event("startup")
async def startup_event():
    """Startup event handler"""
    logger.info("=" * 60)
    logger.info("  Malware Detection ML Service Starting")
    logger.info("=" * 60)
    logger.info(f"Model Directory: {MODEL_DIR}")
    logger.info(f"Temp Directory: {TEMP_DIR}")
    logger.info(f"Cuckoo Host: {CUCKOO_HOST}")
    
    if predictor is None:
        logger.error("⚠ WARNING: Predictor not initialized. Model predictions will fail.")
    
    if cuckoo is None:
        logger.warning("⚠ WARNING: Cuckoo client not available. Sandbox analysis disabled.")


@app.get("/")
async def root():
    """API health check and info"""
    return {
        "service": "Malware Detection ML Service",
        "version": "1.0.0",
        "status": "running",
        "predictor_loaded": predictor is not None,
        "cuckoo_available": cuckoo is not None,
        "models_loaded": predictor.models_loaded if predictor else False
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    health = {
        "status": "healthy",
        "predictor": "loaded" if predictor else "not loaded",
        "cuckoo": "available" if cuckoo else "unavailable"
    }
    
    if predictor is None:
        health["status"] = "degraded"
    
    return health


@app.post("/api/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload file for malware analysis
    
    Flow:
    1. Save uploaded file
    2. Submit to Cuckoo Sandbox
    3. Return task ID for status tracking
    """
    
    if cuckoo is None:
        raise HTTPException(
            status_code=503,
            detail="Cuckoo Sandbox not available"
        )
    
    # Generate unique task ID
    import uuid
    task_id = str(uuid.uuid4())
    
    # Save file temporarily
    file_path = os.path.join(TEMP_DIR, f"{task_id}_{file.filename}")
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"File saved: {file_path}")
        
    except Exception as e:
        logger.error(f"File save error: {e}")
        raise HTTPException(status_code=500, detail=f"File save failed: {str(e)}")
    
    # Store task info
    analysis_tasks[task_id] = {
        "status": AnalysisStatus.PENDING,
        "filename": file.filename,
        "file_path": file_path,
        "cuckoo_task_id": None,
        "result": None
    }
    
    # Submit to Cuckoo in background
    try:
        cuckoo_task_id = cuckoo.submit_file(file_path)
        
        if cuckoo_task_id:
            analysis_tasks[task_id]["cuckoo_task_id"] = cuckoo_task_id
            analysis_tasks[task_id]["status"] = AnalysisStatus.RUNNING
            logger.info(f"Submitted to Cuckoo: Task {task_id} -> Cuckoo Task {cuckoo_task_id}")
        else:
            analysis_tasks[task_id]["status"] = AnalysisStatus.FAILED
            raise HTTPException(status_code=500, detail="Cuckoo submission failed")
            
    except Exception as e:
        logger.error(f"Cuckoo submission error: {e}")
        analysis_tasks[task_id]["status"] = AnalysisStatus.FAILED
        raise HTTPException(status_code=500, detail=f"Cuckoo error: {str(e)}")
    
    return UploadResponse(
        success=True,
        task_id=task_id,
        message="File uploaded and submitted to sandbox",
        status=AnalysisStatus.RUNNING
    )


@app.get("/api/status/{task_id}", response_model=StatusResponse)
async def get_status(task_id: str):
    """
    Get analysis status
    
    Checks Cuckoo status and processes results when ready
    """
    
    if task_id not in analysis_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = analysis_tasks[task_id]
    
    # If already completed or failed, return cached result
    if task["status"] in [AnalysisStatus.COMPLETED, AnalysisStatus.FAILED]:
        return StatusResponse(
            task_id=task_id,
            status=task["status"],
            message=f"Analysis {task['status']}",
            result=task.get("result")
        )
    
    # Check Cuckoo status
    if cuckoo and task.get("cuckoo_task_id"):
        cuckoo_task_id = task["cuckoo_task_id"]
        
        try:
            cuckoo_status = cuckoo.get_task_status(cuckoo_task_id)
            logger.info(f"Cuckoo status for task {cuckoo_task_id}: {cuckoo_status}")
            
            if cuckoo_status == "reported":
                # Analysis complete, get report and predict
                logger.info(f"Fetching report for Cuckoo task {cuckoo_task_id}")
                
                report = cuckoo.get_report(cuckoo_task_id)
                
                if report:
                    api_sequence = cuckoo.extract_api_calls(report)
                    logger.info(f"Extracted {len(api_sequence.split())} API calls")
                    
                    # Run prediction
                    if predictor:
                        result = predictor.predict(api_sequence)
                        task["result"] = result
                        task["status"] = AnalysisStatus.COMPLETED
                        
                        # Cleanup temp file
                        if os.path.exists(task["file_path"]):
                            os.remove(task["file_path"])
                    else:
                        task["status"] = AnalysisStatus.FAILED
                        task["result"] = {"success": False, "error": "Predictor not available"}
                else:
                    task["status"] = AnalysisStatus.FAILED
                    task["result"] = {"success": False, "error": "Failed to get Cuckoo report"}
                    
            elif cuckoo_status in ["failed", "error"]:
                task["status"] = AnalysisStatus.FAILED
                task["result"] = {"success": False, "error": "Cuckoo analysis failed"}
                
        except Exception as e:
            logger.error(f"Error checking Cuckoo status: {e}")
            task["status"] = AnalysisStatus.FAILED
            task["result"] = {"success": False, "error": str(e)}
    
    return StatusResponse(
        task_id=task_id,
        status=task["status"],
        message=f"Analysis {task['status']}",
        result=task.get("result")
    )


@app.post("/api/predict", response_model=PredictionResponse)
async def predict_from_sequence(request: PredictionRequest):
    """
    Direct prediction from API sequence
    
    Use when API sequence is already extracted
    """
    
    if predictor is None:
        raise HTTPException(
            status_code=503,
            detail="ML Predictor not available"
        )
    
    if not request.api_sequence:
        raise HTTPException(
            status_code=400,
            detail="API sequence is required"
        )
    
    try:
        result = predictor.predict(request.api_sequence)
        result['success'] = True
        return PredictionResponse(**result)

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


@app.get("/api/models")
async def get_model_info():
    """Get information about loaded models"""
    
    if predictor is None:
        return {
            "error": "Models not loaded",
            "model_dir": MODEL_DIR
        }
    
    return {
        "model_type": "Random Forest",
        "feature_engineering": "TF-IDF + PCA",
        "classes": predictor.get_classes(),
        "tfidf_features": predictor.get_tfidf_features(),
        "pca_components": predictor.get_pca_components(),
        "model_dir": MODEL_DIR
    }


@app.delete("/api/task/{task_id}")
async def delete_task(task_id: str):
    """Delete task from memory"""
    
    if task_id in analysis_tasks:
        task = analysis_tasks[task_id]
        
        # Cleanup temp file if exists
        if os.path.exists(task.get("file_path", "")):
            os.remove(task["file_path"])
        
        del analysis_tasks[task_id]
        
        return {"success": True, "message": "Task deleted"}
    
    raise HTTPException(status_code=404, detail="Task not found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)