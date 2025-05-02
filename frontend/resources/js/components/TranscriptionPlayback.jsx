import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import PropTypes from "prop-types";
import React from "react";

const TranscriptionPlayback = React.memo(function TranscriptionPlayback({
    audioUrl,
    transcript,
    words = [],
    fileName,
    isWhisper,
}) {
    const waveformRef = useRef(null);
    const wavesurferRef = useRef(null);
    const transcriptRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [lastLoadedUrl, setLastLoadedUrl] = useState(null);
    const [followTranscript, setFollowTranscript] = useState(true);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    useEffect(() => {
        if (!waveformRef.current || !audioUrl) return;

        if (!wavesurferRef.current) {
            wavesurferRef.current = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: "#4a6bff",
                progressColor: "#2c3e50",
                cursorColor: "#1a1a1a",
                height: 100,
                barWidth: 3,
                responsive: true,
                backend: "WebAudio",
                autoCenter: true,
            });

            wavesurferRef.current.on("ready", () => {
                setDuration(wavesurferRef.current.getDuration());
            });

            wavesurferRef.current.on("play", () => setIsPlaying(true));
            wavesurferRef.current.on("pause", () => setIsPlaying(false));
            wavesurferRef.current.on("finish", () => {
                setIsPlaying(false);
                setCurrentTime(0);
            });

            wavesurferRef.current.on("audioprocess", (time) => {
                setCurrentTime(time);
            });

            wavesurferRef.current.on("seek", (ratio) => {
                const dur = wavesurferRef.current.getDuration();
                setCurrentTime(ratio * dur);
            });
        }

        if (audioUrl !== lastLoadedUrl) {
            wavesurferRef.current.load(audioUrl);
            setLastLoadedUrl(audioUrl);
        }
    }, [audioUrl]);

    useEffect(() => {
        if (!transcriptRef.current || !words.length) return;

        const tolerance = 0.15;
        let activeElement = null;

        transcriptRef.current.querySelectorAll(".word").forEach((el) => {
            const start = parseFloat(el.dataset.start);
            const end = parseFloat(el.dataset.end);
            const isActive =
                currentTime >= start - tolerance &&
                currentTime <= end + tolerance;

            el.classList.toggle("active-word", isActive);
            if (isActive) activeElement = el;
        });

        if (activeElement && followTranscript) {
            activeElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [currentTime, words, followTranscript]);

    const togglePlay = () => {
        wavesurferRef.current?.playPause();
    };

    const handleWordClick = (time) => {
        wavesurferRef.current?.seekTo(time / duration);
    };

    const handlePlaybackRateChange = (e) => {
        const rate = parseFloat(e.target.value);
        setPlaybackRate(rate);
        wavesurferRef.current?.setPlaybackRate(rate);
    };

    const getFileExtension = (name) => {
        if (!name) return "";
        const parts = name.split(".");
        return parts.length > 1 ? parts.pop().toUpperCase() : "";
    };

    const fileExt = getFileExtension(fileName);

    const getBadgeClass = (ext) => {
        const colorMap = {
            MP3: "bg-success",
            WAV: "bg-primary",
            M4A: "bg-info text-dark",
            MP4: "bg-warning text-dark",
            WEBM: "bg-danger",
            OGG: "bg-dark",
            FLAC: "bg-secondary",
        };
        return colorMap[ext] || "bg-secondary";
    };

    return (
        <div className="card mb-4">
            <div className="card-header bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div className="d-flex align-items-center gap-3">
                    <h6 className="mb-0">
                        Now Playing: <strong>{fileName || "[Unnamed File]"}</strong>
                    </h6>
                    {fileExt && (
                        <span className={`badge text-uppercase ${getBadgeClass(fileExt)}`}>{fileExt}</span>
                    )}
                </div>
                <div className="d-flex align-items-center gap-3">
                    {isWhisper && (
                        <div className="form-check form-switch">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="followTranscriptToggle"
                                checked={followTranscript}
                                onChange={() => setFollowTranscript((prev) => !prev)}
                            />
                            <label
                                className="form-check-label small"
                                htmlFor="followTranscriptToggle"
                            >
                                Follow Transcript
                            </label>
                        </div>
                    )}
                    <div className="small text-muted">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                </div>
            </div>

            <div className="card-body">
                <div
                    ref={waveformRef}
                    id="waveform"
                    style={{ background: "#f8f9fa", minHeight: "100px" }}
                ></div>

                <div className="d-flex gap-2 align-items-center mt-3">
                    <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={togglePlay}
                    >
                        <i className={`bi bi-${isPlaying ? "pause" : "play"}-fill`}></i>
                    </button>

                    <input
                        type="range"
                        className="form-range flex-grow-1"
                        min="0"
                        max={duration || 1}
                        step="0.01"
                        value={currentTime}
                        onChange={(e) => handleWordClick(parseFloat(e.target.value))}
                    />

                    <select
                        className="form-select form-select-sm"
                        style={{ width: "85px" }}
                        value={playbackRate}
                        onChange={handlePlaybackRateChange}
                    >
                        <option value="0.5">0.5×</option>
                        <option value="0.75">0.75×</option>
                        <option value="1">1×</option>
                        <option value="1.25">1.25×</option>
                        <option value="1.5">1.5×</option>
                        <option value="2">2×</option>
                    </select>
                </div>

                <div
                    ref={transcriptRef}
                    className="mt-4 transcript-container"
                    style={{
                        maxHeight: "300px",
                        overflowY: "auto",
                        padding: "1rem",
                        background: "#fff",
                        lineHeight: 1.6,
                    }}
                >
                    {words.length > 0 ? (
                        words.map((word, idx) => (
                            <span
                                key={idx}
                                className="word"
                                data-start={word.start}
                                data-end={word.end}
                                title={`Click to seek to ${formatTime(word.start)}`}
                                onClick={() => handleWordClick(word.start)}
                                style={{ padding: "0 0.2em", cursor: "pointer" }}
                            >
                                {word.word + " "}
                            </span>
                        ))
                    ) : (
                        <div
                            dangerouslySetInnerHTML={{
                                __html: transcript?.replace(/\n/g, "<br>") || "[No transcript]",
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
});

TranscriptionPlayback.propTypes = {
    audioUrl: PropTypes.string,
    transcript: PropTypes.string,
    words: PropTypes.arrayOf(
        PropTypes.shape({
            word: PropTypes.string.isRequired,
            start: PropTypes.number.isRequired,
            end: PropTypes.number.isRequired,
        })
    ),
    fileName: PropTypes.string,
    isWhisper: PropTypes.bool,
};

export default TranscriptionPlayback;
