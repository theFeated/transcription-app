# 🎛️ Transcription Frontend

A modern, user-friendly Laravel + React interface for managing audio transcription tasks with real-time status updates and waveform playback.

## 📋 Overview

This frontend provides an intuitive transcription studio where users can upload audio, select transcription engines (Whisper or Gemini), view job status, and interact with the transcribed results — all with a responsive and accessible UI.

## 🗂️ Project Structure

transcription_frontend/
├── app/                  
│   ├── Http/
│   │   └── Controllers/Api/      # API endpoints for React frontend
│   │       ├── TranscriptionController.php
│   │       └── FileController.php
│   ├── Models/
│   │   └── TranscriptionJob.php
├── resources/
│   ├── js/
│   │   ├── components/           # React components
│   │   │   ├── FileUpload.jsx
│   │   │   ├── AudioPlayer.jsx
│   │   │   ├── TranscriptViewer.jsx
│   │   │   ├── FileQueue.jsx
│   │   │   └── EngineSelector.jsx
│   │   ├── pages/
│   │   │   └── TranscriptionStudio.jsx
│   │   ├── app.js
│   │   └── bootstrap.js
│   └── views/
│       └── app.blade.php
├── routes/
│   ├── api.php
│   └── web.php
├── package.json
├── vite.config.js
└── ...

## 🚀 Getting Started

### 📦 Install Frontend Dependencies

cd transcription_frontend
npm install

### ⚙️ Install Backend (Laravel) Dependencies

composer install

### 🔑 Set Up Environment Variables

cp .env.example .env
php artisan key:generate

Update .env to match your backend API URLs and database settings.

### 🧪 Run Migrations (if needed)

php artisan migrate

## 🖥️ Running the App

Start both Laravel backend (API) and React frontend with:

npm run dev

php artisan serve