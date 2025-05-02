# File: app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import transcribe, analyze, status

app = FastAPI(title="Transcription Backend API")

# CORS for frontend support
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transcribe.router)  # No prefix
app.include_router(analyze.router, prefix="/analyze")
app.include_router(status.router, prefix="")  # assuming this handles /status and /result

@app.get("/ping")
def ping():
    from app.services.audio_utils import ensure_ffmpeg, whisper_available
    from app.core.config import WHISPER_MODEL
    return {
        "server": "running",
        "ffmpeg": ensure_ffmpeg(),
        "whisper": whisper_available(),
        "whisper_model": WHISPER_MODEL if whisper_available() else None
    }