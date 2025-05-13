import React from 'react';
import ReactDOM from 'react-dom/client';
import TranscriptionStudio from './pages/TranscriptionStudio';
import './bootstrap';
import '../css/app.css';

ReactDOM.createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <TranscriptionStudio />
    </React.StrictMode>
);
