# File: app/core/config.py
import os
from pathlib import Path
import tempfile

UPLOAD_FOLDER = Path(tempfile.gettempdir()) / 'transcribe_uploads'
UPLOAD_FOLDER.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'webm', 'mp4', 'mov', 'avi', 'mkv'}
WHISPER_MODEL = "base"
WHISPER_CACHE_DIR = Path.home() / ".cache" / "whisper"
WHISPER_CACHE_DIR.mkdir(exist_ok=True, parents=True)

CHUNK_DURATION = 30
