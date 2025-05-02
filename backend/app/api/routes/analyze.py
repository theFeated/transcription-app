# File: app/api/routes/analyze.py
from fastapi import APIRouter, UploadFile
import tempfile
from app.services.audio_utils import get_audio_info
from app.core.config import ALLOWED_EXTENSIONS

router = APIRouter()

@router.post("")
async def analyze(file: UploadFile):
    if file.filename.split(".")[-1].lower() not in ALLOWED_EXTENSIONS:
        return {"error": "File type not allowed."}
    
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp.flush()
        info = get_audio_info(tmp.name)
    return info
