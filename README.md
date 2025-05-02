# 🎙️ Transcription App

A full-stack, containerized audio transcription system built with:

- ⚙️ **FastAPI** backend (Python) for real-time transcription (Whisper/Gemini engines)
- 🎨 **Laravel + React** frontend for a modern transcription studio interface
- 🐳 **Dockerized** for easy deployment and local dev

## 📸 Screenshots

### 🖥️ Transcription Studio UI
![Transcription Studio UI](./screenshots/trans_app_1.png)

### 📊 Transcription Job View
![Job View](./screenshots/trans_app.png)

## 🚀 Features

- ✅ Upload audio files (WAV, MP3, etc.)
- ✅ View waveforms and transcript in a split layout
- ✅ Run transcription using **Whisper** or **Gemini**
- ✅ Monitor status in a live queue
- ✅ Export results
- ✅ Toggle between Safe Mode / Dual Mode
- ✅ Fully local and private by default

### Backend
cd transcription_backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001

### Frontend
npm run build
npm run dev
php artisan serve

