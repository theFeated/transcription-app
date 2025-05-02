# 🎙️ Transcription Backend

A powerful and scalable audio transcription service with multi-model support for Whisper and Gemini models.

## 📋 Overview

This backend service provides a robust API for transcribing audio files, analyzing the transcription results, and managing the status of transcription jobs. It uses FastAPI for the web framework and Celery for handling long-running transcription tasks asynchronously.

## 🗂️ Project Structure
transcription_backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── transcribe.py    # Endpoints for transcription requests
│   │   │   ├── analyze.py       # Endpoints for analysis of transcribed content
│   │   │   └── status.py        # Endpoints for checking job status
│   │   └── deps.py              # Dependency injection utilities
│   ├── core/
│   │   ├── config.py            # Application configuration
│   │   └── logging_config.py    # Logging setup
│   ├── services/
│   │   ├── audio_utils.py       # Audio processing utilities
│   │   ├── whisper_transcriber.py  # OpenAI Whisper integration
│   │   ├── gemini_transcriber.py   # Google Gemini integration
│   │   └── job_manager.py       # Job queue management
│   ├── workers/
│   │   └── tasks.py             # Background task definitions
│   ├── models/
│   │   └── schemas.py           # Pydantic models for data validation
│   └── main.py                  # Application entry point
├── index.html                   # Main frontend page
├── requirements.txt             # Project dependencies
└── README.md                    # This documentation

## 🚀 Getting Started

### Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

### Install dependencies
pip install -r requirements.txt

### Set up environment variables

# Create a .env file with your configuration
cp .env.example .env
# Edit .env with your settings

## 🖥️ Running the Application

### Start the API Server

uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

### Simple File Server (for development)

If you need a simple file server for testing or development:

python -m http.server 8080

## 🌐 Accessing the Application

Once the server is running, you can access:

- File server (if running): http://localhost:8080/