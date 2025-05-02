import time
from app.services.gemini_transcriber import process_gemini_job
from app.models.schemas import UploadResponse, StatusResponse, TranscriptResponse
from app.core.config import UPLOAD_FOLDER
from pathlib import Path
import threading

jobs = {}
safe_mode_lock = threading.Lock()

def get_whisper_handler():
    from app.services.whisper_transcriber import process_whisper_job
    return process_whisper_job

def create_job(job_id: str, file_path: Path, api_key: str, safe_mode: bool = False) -> UploadResponse:
    engine = "whisper" if api_key.lower() == "whisper" else "gemini"
    job_info = {
        "status": "processing",
        "stage": "init",
        "progress": 0,
        "engine": engine,
        "input_file": str(file_path),
        "output_dir": str(file_path.parent),
        "created_at": time.time(),
        "api_key": api_key,
        "safe_mode": safe_mode
    }
    jobs[job_id] = job_info

    def run_job():
        if engine == "whisper":
            handler = get_whisper_handler()
            handler(job_id)
        else:
            process_gemini_job(job_id, api_key)

    def safe_run_job():
        with safe_mode_lock:
            run_job()

    thread = threading.Thread(
        target=safe_run_job if safe_mode else run_job
    )
    thread.daemon = True
    thread.start()

    return UploadResponse(job_id=job_id, status="processing", engine=engine)

def get_job_status(job_id: str) -> StatusResponse:
    job = jobs.get(job_id)
    if not job:
        return StatusResponse(status="not_found", stage="", progress=0, error="Job not found", engine="unknown")
    return StatusResponse(**job)

def get_job_result(job_id: str) -> TranscriptResponse:
    job = jobs.get(job_id)
    if not job or job['status'] != 'completed':
        return TranscriptResponse(transcription="", engine="unknown")

    transcript_path = Path(job['output_dir']) / ("transcript.json" if job['engine'] == "whisper" else "transcript.txt")

    if not transcript_path.exists():
        return TranscriptResponse(transcription="[Missing transcript file]", engine=job.get("engine", "unknown"))

    if job['engine'] == "whisper":
        import json
        data = json.loads(transcript_path.read_text(encoding='utf-8'))
        return TranscriptResponse(
            transcription=data.get('text', ""),
            engine="whisper",
            words=sum([seg.get('words', []) for seg in data.get('segments', []) if 'words' in seg], []),
            paragraph_breaks=[i for i, seg in enumerate(data.get('segments', [])) if seg.get('paragraph_break')]
        )
    else:
        return TranscriptResponse(
            transcription=transcript_path.read_text(encoding='utf-8').strip(),
            engine="gemini"
        )

def cleanup_job(job_id: str):
    job = jobs.pop(job_id, None)
    if job:
        job_dir = Path(job['output_dir'])
        if job_dir.exists():
            import shutil
            shutil.rmtree(job_dir)
    return {"status": "deleted"}
