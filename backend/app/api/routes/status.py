# File: app/api/routes/status.py
from fastapi import APIRouter
from app.services.job_manager import get_job_status, get_job_result, cleanup_job

router = APIRouter()

@router.get("/status/{job_id}")
def status(job_id: str):
    return get_job_status(job_id)

@router.get("/result/{job_id}")
def result(job_id: str):
    return get_job_result(job_id)

@router.delete("/cleanup/{job_id}")
def cleanup(job_id: str):
    return cleanup_job(job_id)