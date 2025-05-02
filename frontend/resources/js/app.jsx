import React from 'react';
import ReactDOM from 'react-dom/client';
import TranscriptionStudio from './pages/TranscriptionStudio';
import './bootstrap';

ReactDOM.createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <TranscriptionStudio />
    </React.StrictMode>
);
