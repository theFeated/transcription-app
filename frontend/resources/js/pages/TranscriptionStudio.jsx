import { useState, useEffect, useMemo } from "react";
import { usePersistedJobs } from "/src/hooks/usePersistedJobs";
import axios from "axios";
import Swal from "sweetalert2";
import EngineSelector from "@/components/EngineSelector";
import FileUpload from "../components/FileUpload";
import TranscriptionPlayback from "@/components/TranscriptionPlayback";
import TranscriptActions from "@/components/TranscriptActions";
import FileQueue from "../components/FileQueue";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DarkModeToggle from "../components/DarkModeToggle";

export default function TranscriptionStudio() {
    const {
        jobs,
        setJobs,
        activeJob,
        setActiveJobId,
        removeJob,
        resetAllJobs,
    } = usePersistedJobs();

    const [currentEngine, setCurrentEngine] = useState("whisper");
    const [engineLocked, setEngineLocked] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [serverStatus, setServerStatus] = useState(false);
    const [autoStart, setAutoStart] = useState(false);
    const [safeMode, setSafeMode] = useState(true);
    const [whisperConcurrency, setWhisperConcurrency] = useState(1); // Max 10

    const BACKEND_URL =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:8001";

    const audioUrl = useMemo(() => {
        if (!activeJob?.file) return null;
        return URL.createObjectURL(activeJob.file);
    }, [activeJob]);

    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    useEffect(() => {
        checkServerStatus();
        const interval = setInterval(checkServerStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!autoStart) return;

        const pendingJobs = Object.entries(jobs).filter(
            ([_, job]) => job.status === "pending"
        );

        if (pendingJobs.length === 0) return;

        if (safeMode || currentEngine === "gemini") {
            // Let safe mode or Gemini go through full sequential upload
            handleStartTranscription();
        } else {
            // Respect Whisper concurrency
            const activeWhisper = Object.values(jobs).filter(
                (job) => job.status === "processing" && job.engine === "whisper"
            ).length;

            const availableSlots = whisperConcurrency - activeWhisper;

            if (availableSlots <= 0) return;

            const toStart = pendingJobs
                .filter(([_, job]) => job.engine === "whisper")
                .slice(0, availableSlots);

            for (const [jobId] of toStart) {
                handleStartSingleJob(jobId);
            }
        }
    }, [jobs, autoStart, safeMode, currentEngine, whisperConcurrency]);

    useEffect(() => {
        if (currentEngine === "gemini") {
            setSafeMode(true); // Always on for Gemini
        }
    }, [currentEngine]);

    const checkServerStatus = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/ping`);
            setServerStatus(response.data.server === "running");
        } catch (error) {
            setServerStatus(false);
            toast.error("Failed to connect to server");
        }
    };

    const handleFilesSelected = (files) => {
        if (!files?.length) return;

        const newJobs = { ...jobs };
        let newFileCount = 0;

        Array.from(files).forEach((file) => {
            const alreadyExists = Object.values(jobs).some(
                (job) => job.name === file.name && job.file.size === file.size
            );

            if (alreadyExists) {
                toast.warning(`"${file.name}" is already in the queue`);
                return;
            }

            const jobId = `job-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 5)}`;
            newJobs[jobId] = {
                id: jobId,
                file,
                name: file.name || "Untitled",
                status: "pending",
                progress: 0,
                stage: "Waiting",
                transcript: "",
                engine: currentEngine,
                words: [],
            };

            newFileCount++;
        });

        setJobs(newJobs);

        if (newFileCount > 0) {
            toast.success(
                `${newFileCount} new file${
                    newFileCount > 1 ? "s" : ""
                } added to queue`
            );
        }
    };

    const handleStartSingleJob = async (jobId) => {
        const job = jobs[jobId];
        if (!job || job.status !== "pending") return;
        if (!serverStatus) return toast.error("Server is offline");
        if (currentEngine === "gemini" && !apiKey)
            return toast.error("Please enter your Gemini API key");

        const updatedJobs = { ...jobs };
        updatedJobs[jobId].status = "processing";
        setJobs({ ...updatedJobs });

        if (!engineLocked) setEngineLocked(true);

        try {
            const formData = new FormData();
            formData.append("file", job.file);
            formData.append(
                "api_key",
                currentEngine === "whisper" ? "whisper" : apiKey
            );
            formData.append("safe_mode", safeMode ? "true" : "false");

            const res = await axios.post(`${BACKEND_URL}/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                timeout: 30000,
            });

            await pollStatus(jobId, res.data.job_id);
        } catch (err) {
            updatedJobs[jobId].status = "failed";
            updatedJobs[jobId].error = err.message;
            setJobs({ ...updatedJobs });
            toast.error(`Failed to upload ${job.name}: ${err.message}`);
        }
    };

    const handleStartTranscription = async () => {
        const pendingJobIds = Object.keys(jobs).filter(
            (id) => jobs[id].status === "pending"
        );

        if (!pendingJobIds.length)
            return toast.info("No pending jobs to process");

        if (safeMode || currentEngine === "gemini") {
            // Only start one job at a time in Safe Mode
            const isProcessing = Object.values(jobs).some(
                (job) => job.status === "processing"
            );
            if (!isProcessing && pendingJobIds.length > 0) {
                await handleStartSingleJob(pendingJobIds[0]);
            }
        } else if (currentEngine === "whisper") {
            // Enforce concurrency limit for Whisper
            let activeCount = Object.values(jobs).filter(
                (job) => job.status === "processing" && job.engine === "whisper"
            ).length;

            for (const jobId of pendingJobIds) {
                if (activeCount >= whisperConcurrency) break;
                await handleStartSingleJob(jobId);
                activeCount++;
            }
        }
    };

    const pollStatus = async (clientJobId, serverJobId) => {
        const checkStatus = async () => {
            try {
                const response = await axios.get(
                    `${BACKEND_URL}/status/${serverJobId}`,
                    { timeout: 10000 }
                );
                const data = response.data;

                setJobs((prevJobs) => {
                    const current = prevJobs[clientJobId];
                    if (!current) return prevJobs;

                    const unchanged =
                        current.status === data.status &&
                        current.progress === data.progress &&
                        current.stage === data.stage;

                    if (unchanged) return prevJobs;

                    return {
                        ...prevJobs,
                        [clientJobId]: {
                            ...current,
                            progress: data.progress || 0,
                            stage: data.stage || "Processing",
                            status: data.status || "processing",
                        },
                    };
                });

                if (data.status === "completed") {
                    try {
                        const result = (
                            await axios.get(
                                `${BACKEND_URL}/result/${serverJobId}`,
                                { timeout: 10000 }
                            )
                        ).data;

                        setJobs((prevJobs) => {
                            const updated = { ...prevJobs };
                            if (!updated[clientJobId]) return updated;
                            updated[clientJobId] = {
                                ...updated[clientJobId],
                                transcript: result.transcription || "",
                                words: Array.isArray(result.words)
                                    ? result.words
                                    : [],
                                engine: result.engine || currentEngine,
                                status: "completed",
                            };
                            return updated;
                        });

                        setActiveJobId(clientJobId);
                        toast.success("Transcription complete");
                    } catch (err) {
                        setJobs((prevJobs) => ({
                            ...prevJobs,
                            [clientJobId]: {
                                ...prevJobs[clientJobId],
                                status: "failed",
                                error: err.message,
                            },
                        }));
                        toast.error(
                            `Failed to get results for job ${clientJobId}`
                        );
                    }
                } else if (data.status === "failed") {
                    setJobs((prevJobs) => ({
                        ...prevJobs,
                        [clientJobId]: {
                            ...prevJobs[clientJobId],
                            status: "failed",
                            error: data.error,
                        },
                    }));
                    toast.error(`Job failed: ${data.error}`);
                } else {
                    setTimeout(checkStatus, 2000);
                }
            } catch (err) {
                setTimeout(checkStatus, 5000);
            }
        };
        checkStatus();
    };

    const handleJobSelect = (job) => {
        if (job?.status === "completed") {
            setActiveJobId(job.id);
        }
    };

    const handleReset = () => {
        Swal.fire({
            title: "Reset all transcriptions?",
            text: "This will clear all jobs and transcripts from the session.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, reset",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                resetAllJobs();

                setEngineLocked(false);

                const fileInput = document.getElementById("mediaFiles");
                if (fileInput) fileInput.value = "";
                window.scrollTo({ top: 0, behavior: "smooth" });
                toast.info("Reset all jobs");
            }
        });
    };

    const pendingJobsExist = Object.values(jobs).some(
        (job) => job.status === "pending"
    );

    const canReset = Object.keys(jobs).length > 0 || activeJob !== null;

    return (
        <div className="container py-4">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                draggable
                theme="colored"
            />
            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <h1 className="h5 mb-0 me-3">
                            <i className="bi bi-mic-fill me-2"></i>Transcription
                            Studio
                        </h1>
                        <span className="badge bg-light text-dark">
                            <i
                                className={`bi bi-circle-fill me-1 text-${
                                    serverStatus ? "success" : "danger"
                                }`}
                            ></i>
                            {serverStatus
                                ? "Connected"
                                : "Offline"}
                        </span>
                    </div>
                    <DarkModeToggle />
                </div>

                <div className="card-body">
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <EngineSelector
                                currentEngine={currentEngine}
                                onEngineChange={setCurrentEngine}
                                apiKey={apiKey}
                                onApiKeyChange={setApiKey}
                                engineLocked={engineLocked}
                            />
                        </div>
                        <div className="col-md-6">
                            <FileUpload onFilesSelected={handleFilesSelected} />

                            <div className="d-flex gap-2 mt-3">
                                <button
                                    onClick={handleStartTranscription}
                                    className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                                    disabled={!pendingJobsExist}
                                >
                                    <i className="bi bi-play-fill"></i>
                                    Start Transcription
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="btn btn-outline-danger"
                                    disabled={!canReset}
                                >
                                    <i className="bi bi-arrow-counterclockwise"></i>{" "}
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {activeJob && (
                        <>
                            <TranscriptionPlayback
                                audioUrl={audioUrl}
                                transcript={activeJob.transcript}
                                words={activeJob.words}
                                fileName={activeJob.name}
                                isWhisper={currentEngine === "whisper"}
                            />
                            <TranscriptActions job={activeJob} allJobs={jobs} />
                        </>
                    )}

                    <FileQueue
                        jobs={jobs}
                        onJobSelect={handleJobSelect}
                        onJobDelete={(jobId) => removeJob(jobId)}
                        autoStart={autoStart}
                        setAutoStart={setAutoStart}
                        onJobStart={handleStartSingleJob}
                        safeMode={safeMode}
                        setSafeMode={setSafeMode}
                        currentEngine={currentEngine}
                        whisperConcurrency={whisperConcurrency}
                        setWhisperConcurrency={setWhisperConcurrency}
                    />
                </div>
            </div>
        </div>
    );
}
