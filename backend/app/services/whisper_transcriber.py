# PATCHED: app/services/whisper_transcriber.py
# Whisper fully enabled (no longer blocked on Windows)
from app.core.logging_config import logger
from app.core.config import WHISPER_MODEL, WHISPER_CACHE_DIR
import subprocess, json
from pathlib import Path
import whisper

def process_whisper_job(job_id):
    from app.services.job_manager import jobs
    job = jobs[job_id]
    input_path = Path(job["input_file"])
    output_dir = Path(job["output_dir"])
    output_audio = output_dir / "audio.wav"

    try:
        print(f"[WHISPER] Converting audio for job {job_id}...")
        ffmpeg_result = subprocess.run([
            'ffmpeg', '-i', str(input_path), '-ar', '16000', '-ac', '1', '-f', 'wav', str(output_audio)
        ], check=True, capture_output=True, text=True)
        print(f"[WHISPER] FFmpeg output:\n{ffmpeg_result.stdout}")

        job["stage"] = "loading model"
        print(f"[WHISPER] Loading model for job {job_id}...")
        model = whisper.load_model(WHISPER_MODEL, download_root=str(WHISPER_CACHE_DIR))

        job["stage"] = "transcribing"
        print(f"[WHISPER] Transcribing audio for job {job_id}...")
        result = model.transcribe(str(output_audio), word_timestamps=True)

        json_path = output_dir / "transcript.json"
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        job["status"] = "completed"
        job["progress"] = 1.0
        job["stage"] = "done"
        print(f"[WHISPER] Job {job_id} completed successfully.")

    except subprocess.CalledProcessError as ffmpeg_error:
        job["status"] = "failed"
        job["error"] = ffmpeg_error.stderr
        job["stage"] = "failed"
        print(f"[WHISPER ERROR] FFmpeg failed for job {job_id}:\n{ffmpeg_error.stderr}")
        logger.error(f"Whisper job {job_id} FFmpeg error: {ffmpeg_error.stderr}")

    except Exception as e:
        job["status"] = "failed"
        job["error"] = str(e)
        job["stage"] = "failed"
        print(f"[WHISPER ERROR] Unexpected failure in job {job_id}: {e}")
        logger.error(f"Whisper job {job_id} failed: {e}")
