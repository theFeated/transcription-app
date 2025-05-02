# File: app/services/audio_utils.py
import subprocess
import json
from app.core.logging_config import logger

def ensure_ffmpeg():
    try:
        subprocess.run(['ffmpeg', '-version'], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return True
    except Exception:
        return False

def get_audio_info(path):
    cmd = [
        'ffprobe', '-v', 'error', '-show_entries', 'format=duration,size',
        '-of', 'json', str(path)
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    return json.loads(result.stdout)

def whisper_available():
    try:
        import whisper
        return True
    except ImportError:
        return False