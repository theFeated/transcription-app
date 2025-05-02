# File: app/models/schemas.py
from pydantic import BaseModel
from typing import Optional, List

class UploadResponse(BaseModel):
    job_id: str
    status: str
    engine: str

class StatusResponse(BaseModel):
    status: str
    stage: str
    progress: float
    error: Optional[str] = ""
    engine: str

class TranscriptResponse(BaseModel):
    transcription: str
    engine: str
    words: Optional[List[dict]] = []
    paragraph_breaks: Optional[List[int]] = []
