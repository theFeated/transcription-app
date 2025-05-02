# PATCHED: app/services/gemini_transcriber.py
from app.core.logging_config import logger
import base64, requests, json, subprocess, re
from pathlib import Path

def process_gemini_job(job_id, api_key):
    from app.services.job_manager import jobs
    job = jobs[job_id]
    audio_path = Path(job['input_file'])
    output_dir = Path(job['output_dir'])
    api_key = job['api_key'] if 'api_key' in job else job['engine']

    try:
        output_audio = output_dir / "audio.wav"
        subprocess.run([
            'ffmpeg', '-i', str(audio_path), '-ar', '16000', '-ac', '1', '-f', 'wav', str(output_audio)
        ], check=True)

        job["stage"] = "encoding"

        audio_base64 = base64.b64encode(output_audio.read_bytes()).decode('utf-8')

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
        payload = {
            "contents": [{
                "parts": [
                    {"text": "Transcribe this audio into text."},
                    {"inline_data": {
                        "mime_type": "audio/wav",
                        "data": audio_base64
                    }}
                ]
            }]
        }

        job["stage"] = "calling gemini"
        response = requests.post(url, json=payload)
        job["stage"] = "receiving response"

        if response.status_code != 200:
            raise Exception(f"Gemini API error {response.status_code}: {response.text}")

        try:
            data = response.json()
            parts = data['candidates'][0]['content']['parts']
            result = parts[0]['text'].strip() if parts else ""
        except Exception as e:
            logger.error(f"[Gemini] Failed parsing response: {e}")
            logger.error(f"Raw response: {response.text}")
            raise

        if not result:
            raise Exception("Gemini API returned an empty transcript")

        # ✨ FORMAT CLEANUP: Split into clean paragraph chunks
        sentences = re.split(r'(?<=[.!?])\s+', result)
        paragraphs = []
        buffer = []

        for i, sentence in enumerate(sentences):
            buffer.append(sentence.strip())
            # Create a paragraph every 3-4 sentences or at the end
            if len(buffer) >= 4 or i == len(sentences) - 1:
                paragraphs.append(" ".join(buffer))
                buffer = []

        result = "\n\n".join(paragraphs)

        # Save cleaned transcript
        text_path = output_dir / "transcript.txt"
        with open(text_path, 'w', encoding='utf-8') as f:
            f.write(result)

        job["status"] = "completed"
        job["progress"] = 1.0
        job["stage"] = "done"

    except Exception as e:
        job["status"] = "failed"
        job["error"] = str(e)
        job["stage"] = "failed"
        logger.error(f"Gemini job {job_id} failed: {e}")
