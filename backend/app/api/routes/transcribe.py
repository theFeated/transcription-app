# File: app/api/routes/transcribe.py
from fastapi import APIRouter, UploadFile, Form
import uuid
from pathlib import Path
from app.core.config import UPLOAD_FOLDER, ALLOWED_EXTENSIONS
from app.services.job_manager import create_job

router = APIRouter()

@router.post("/upload")
async def upload(file: UploadFile, api_key: str = Form(...), safe_mode: bool = Form(False)):
    if file.filename.split(".")[-1].lower() not in ALLOWED_EXTENSIONS:
        return {"error": "File type not allowed."}
    
    job_id = str(uuid.uuid4())
    job_path = UPLOAD_FOLDER / job_id
    job_path.mkdir(parents=True, exist_ok=True)
    dest = job_path / file.filename

    with open(dest, "wb") as f:
        content = await file.read()
        f.write(content)

    job_info = create_job(job_id, dest, api_key, safe_mode)

    return job_info
