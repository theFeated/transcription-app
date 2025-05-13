import Swal from "sweetalert2";
import { useState } from "react";

export default function EngineSelector({
    currentEngine,
    onEngineChange,
    apiKey,
    onApiKeyChange,
    engineLocked,
}) {
    const [keyVisible, setKeyVisible] = useState(false);

    const handleToggleKeyVisibility = () => {
        setKeyVisible(!keyVisible);
    };

    const showGeminiInfo = () => {
        Swal.fire({
            title: "Transcription Engine Info",
            html: `
                <div class="text-start small">
                    <h6 class="fw-bold">Gemini (Cloud)</h6>
                    <ul class="mb-3">
                        <li><strong>Works with the free API</strong> – no billing or paid plans needed.</li>
                        <li><strong>Handles huge files</strong> – successfully tested with a 12GB, 3-hour video.</li>
                        <li><strong>Slow on purpose</strong> – the backend sends requests at a steady pace to avoid hitting Gemini rate limits.</li>
                        <li><strong>Smart backend</strong> – supports background jobs, retries, large files, and live job tracking.</li>
                    </ul>
                    <div class="text-start small text-muted">
                        <strong>Note:</strong> Transcribing multiple files at the same time with 
                        Gemini may overwhelm the API and result in failures or delays. 
                        The system is optimized for <strong>one BIG job at a time</strong> when 
                        using Gemini.
                    </div>

                    <hr class="my-2" />

                    <h6 class="fw-bold">Whisper (Local)</h6>
                    <ul class="mb-3">
                        <li><strong>Runs entirely on your machine</strong> – no internet or cloud needed.</li>
                        <li><strong>Fastest with a GPU</strong> – large files process much quicker on GPU-equipped systems.</li>
                        <li><strong>Supports long audio</strong> – locally transcribes large files like multi-hour videos.</li>
                        <li><strong>Private & offline</strong> – nothing gets sent to the cloud.</li>
                    </ul>
                    <div class="text-start small text-muted">
                        <strong>Note:</strong> Whisper works best with a GPU. On slower CPUs, large files may take a long time to process and can impact system performance during transcription.
                    </div>

                    <hr class="my-2" />

                    <div class="text-start small text-muted">
                        <strong>Tip:</strong> Enable <strong>Safe Mode</strong> to run jobs one at a time. This prevents overloading the Gemini API or your system, especially with large files.
                    </div>
                </div>
            `,
            icon: "info",
            confirmButtonText: "OK",
            customClass: {
                popup: "text-sm",
            },
        });
    };

    return (
        <div className="mb-3">
            <label className="form-label">Transcription Engine</label>

            <div className="d-flex gap-2 mb-2">
                <button
                    className={`btn btn-outline-primary flex-grow-1 ${
                        currentEngine === "whisper" ? "active" : ""
                    }`}
                    onClick={() => !engineLocked && onEngineChange("whisper")}
                    disabled={engineLocked && currentEngine !== "whisper"}
                >
                    <i className="bi bi-cpu me-1"></i> Whisper (Local)
                </button>
                <button
                    className={`btn btn-outline-primary flex-grow-1 ${
                        currentEngine === "gemini" ? "active" : ""
                    }`}
                    onClick={() => {
                        if (engineLocked && currentEngine !== "gemini") return;
                        if (currentEngine !== "gemini") {
                            Swal.fire({
                                title: "Warning: Gemini Mode",
                                icon: "warning",
                                html: `
                        <div class="text-start small">
                            <p><strong>Gemini (Cloud API)</strong> is ideal for <u>one big file at a time</u>.</p>
                            <ul>
                                <li>Works great with <strong>large files</strong> like a <strong>12GB / 3-hour video</strong>.</li>
                                <li>Much <strong>slower</strong> than Whisper — expect long waits.</li>
                                <li>Lacks features like JSON transcript, word timing, or waveform sync.</li>
                                <li>Whisper is faster, offline, and more functional.</li>
                            </ul>
                            <p>If you're not sure — <strong>stick with Whisper</strong>.</p>
                        </div>
                    `,
                                confirmButtonText: "Use Gemini Anyway",
                                cancelButtonText: "Cancel",
                                showCancelButton: true,
                                reverseButtons: true,
                                customClass: { popup: "text-sm" },
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    onEngineChange("gemini");
                                }
                            });
                        }
                    }}
                    disabled={engineLocked && currentEngine !== "gemini"}
                >
                    <i className="bi bi-cloud me-1"></i> Gemini (Cloud)
                </button>
            </div>

            {currentEngine === "gemini" && (
                <div className="input-group">
                    <input
                        type={keyVisible ? "text" : "password"}
                        className="form-control"
                        id="apiKey"
                        placeholder="Enter your  API key"
                        value={apiKey}
                        onChange={(e) => onApiKeyChange(e.target.value)}
                    />
                    <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={handleToggleKeyVisibility}
                        title="Toggle visibility"
                    >
                        <i
                            className={`bi ${
                                keyVisible ? "bi-eye-slash" : "bi-eye"
                            }`}
                        ></i>
                    </button>
                </div>
            )}

            <p className="small text-muted mt-2 dark-mode-text">
                Whisper runs locally (GPU recommended). Gemini uses a cloud API,
                ideal for slower devices or mobile.{" "}
                <button
                    className="btn btn-sm btn-link p-0 align-baseline"
                    onClick={showGeminiInfo}
                    style={{ fontSize: "0.85rem" }}
                >
                    See more
                </button>
            </p>
        </div>
    );
}
