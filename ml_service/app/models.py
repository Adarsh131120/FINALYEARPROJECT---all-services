    # ml-service/app/models.py

from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from enum import Enum


class MalwareFamily(str, Enum):
    """Malware family types"""
    TROJAN = "Trojan"
    WORM = "Worm"
    VIRUS = "Virus"
    BACKDOOR = "Backdoor"
    SPYWARE = "Spyware"
    DOWNLOADER = "Downloader"
    DROPPER = "Dropper"
    ADWARE = "Adware"


class AnalysisStatus(str, Enum):
    """Analysis status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class PredictionRequest(BaseModel):
    """Request model for prediction"""
    task_id: Optional[int] = None
    api_sequence: Optional[str] = Field(
        None,
        description="Space-separated API call sequence",
        example="createfile writefile regsetvalueex createprocess"
    )


class PredictionResponse(BaseModel):
    """Response model for prediction"""
    success: Optional[bool] = True
    malware_family: Optional[str] = None
    confidence: Optional[float] = Field(None, ge=0, le=1)
    probabilities: Optional[Dict[str, float]] = None
    total_api_calls: Optional[int] = None
    unique_api_calls: Optional[int] = None
    critical_apis: Optional[List[str]] = None
    top_apis: Optional[List[str]] = None
    model_used: Optional[str] = "Random Forest"
    error: Optional[str] = None


class UploadResponse(BaseModel):
    """Response for file upload"""
    success: bool
    task_id: str
    message: str
    status: AnalysisStatus


class StatusResponse(BaseModel):
    """Analysis status response"""
    task_id: str
    status: AnalysisStatus
    message: str
    result: Optional[PredictionResponse] = None