<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Transcription Studio</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    
    @viteReactRefresh
    @vite('resources/js/app.jsx')
    
    
    <style>
        :root {
            --whisper-color: #6f42c1;
            --gemini-color: #0d6efd;
        }

        .file-card {
            transition: all 0.2s;
            cursor: pointer;
            border-left: 4px solid var(--bs-primary);
        }

        .file-card.whisper {
            border-left-color: var(--whisper-color);
        }

        .file-card.gemini {
            border-left-color: var(--gemini-color);
        }

        .file-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .progress-thin {
            height: 6px;
        }

        .status-badge {
            font-size: 0.75rem;
        }

        .highlight-word {
            transition: all 0.2s;
            border-radius: 2px;
            padding: 0 1px;
        }

        .active-word {
            background-color: #ffecb3;
            font-weight: 500;
        }

        .engine-badge {
            font-size: 0.7rem;
            padding: 2px 5px;
        }

        .whisper-badge {
            background-color: var(--whisper-color);
        }

        .gemini-badge {
            background-color: var(--gemini-color);
        }

        .transcript-paragraph {
            margin-bottom: 1em;
            line-height: 1.6;
        }

        .word {
            display: inline;
            padding: 0 0.15em;
            word-spacing: normal;
        }

        .word:hover {
            background-color: #e9ecef;
            cursor: pointer;
        }
    </style>
</head>
<body class="bg-light">
    <div id="app"></div>
</body>
</html>