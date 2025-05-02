// ✅ Enhanced FileQueue.jsx with @dnd-kit drag-and-drop + control toggles
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function FileQueue({
    jobs,
    onJobSelect,
    onJobDelete,
    autoStart,
    setAutoStart,
    onJobStart,
    safeMode,
    setSafeMode,
    currentEngine,
    whisperConcurrency,
    setWhisperConcurrency,
}) {
    const [filter, setFilter] = useState("all");
    const [autoRetry, setAutoRetry] = useState(false);
    const [sortedJobIds, setSortedJobIds] = useState(Object.keys(jobs || {}));

    useEffect(() => {
        setSortedJobIds(Object.keys(jobs));
    }, [jobs]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        })
    );

    const getStatusColor = (status) => {
        switch (status) {
            case "completed": return "success";
            case "failed": return "danger";
            case "processing": return "primary";
            default: return "secondary";
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + " bytes";
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
        else return (bytes / 1048576).toFixed(1) + " MB";
    };

    const confirmDelete = (e, job) => {
        e.stopPropagation();
        Swal.fire({
            title: "Delete this job?",
            text: `This will permanently remove "${job.name}" from the queue.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, delete it",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                toast.info(`Job "${job.name}" deleted.`);
                onJobDelete(job.id);
            }
        });
    };

    const handleRetryJob = (job) => {
        job.status = "pending";
        job.error = null;
        job.stage = "Waiting";
        job.progress = 0;
        onJobStart(job.id);
        toast.info(`Retrying job "${job.name}"...`);
    };

    useEffect(() => {
        if (!autoStart) return;
        const isProcessing = Object.values(jobs || {}).some(job => job?.status === "processing");
        const pendingJobs = sortedJobIds
        .map(id => jobs?.[id])
        .filter(job => job?.status === "pending");
            if (pendingJobs.length === 0) return;

        if (safeMode) {
            if (!isProcessing) onJobStart(pendingJobs[0].id);
        } else {
          const currentWhispers = Object.values(jobs || {}).filter(j => j?.status === "processing" && j?.engine === "whisper").length;
          const availableSlots = whisperConcurrency - currentWhispers;
            if (availableSlots > 0) {
              const jobsToStart = pendingJobs.filter(j => j?.engine === "whisper").slice(0, availableSlots);
              jobsToStart.forEach(j => onJobStart(j.id));
            }
        }
    }, [jobs, sortedJobIds, autoStart, safeMode, whisperConcurrency, onJobStart]);

    const DraggableJobCard = ({ jobId }) => {
        const job = jobs[jobId];
        const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: jobId });
        const style = { transform: CSS.Transform.toString(transform), transition };

        return (
            <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`col-12 file-card ${job.engine}`}>
                <div className="card mb-2" style={{ cursor: "grab" }} onClick={() => job.status === "completed" && onJobSelect(job)}>
                    <div className="card-body p-2">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="flex-grow-1 me-2">
                                <div className="d-flex align-items-center mb-1">
                                    <h6 className="mb-0 text-truncate">{job.name}</h6>
                                    <span className={`badge engine-badge ${job.engine}-badge ms-2`}>{job.engine}</span>
                                </div>
                                <small className="text-muted d-block">{formatFileSize(job.file.size)}</small>
                                <div className="progress progress-thin mt-1">
                                    <div className="progress-bar" role="progressbar" style={{ width: `${job.progress * 100}%` }} aria-valuenow={job.progress * 100} aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <span className={`badge status-badge bg-${getStatusColor(job.status)}`}>{job.status === "processing" ? job.stage : job.status}</span>
                                {job.status === "pending" && !safeMode && (
                                    <button className="btn btn-sm btn-outline-primary" onClick={(e) => { e.stopPropagation(); onJobStart(job.id); }} title="Start transcription">
                                        <i className="bi bi-play-fill"></i>
                                    </button>
                                )}
                                {job.status === "failed" && !autoRetry && (
                                    <button className="btn btn-sm btn-outline-warning" onClick={(e) => { e.stopPropagation(); handleRetryJob(job); }} title="Retry transcription">
                                        <i className="bi bi-arrow-repeat"></i>
                                    </button>
                                )}
                                <button className="btn btn-sm btn-outline-danger" onClick={(e) => confirmDelete(e, job)} title="Remove from queue">
                                    <i className="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const onDragEnd = ({ active, over }) => {
        if (active.id !== over?.id) {
            const oldIndex = sortedJobIds.indexOf(active.id);
            const newIndex = sortedJobIds.indexOf(over.id);
            setSortedJobIds(arrayMove(sortedJobIds, oldIndex, newIndex));
        }
    };

    const filteredSortedJobIds = sortedJobIds.filter((id) => {
        const job = jobs[id];
        if (!job) return false;
        if (filter === "all") return true;
        return job.status === filter;
    });

    return (
        <div className="card mt-4">
            <div className="card-header bg-light">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                    <div className="d-flex align-items-center gap-3">
                        <h6 className="mb-0">
                            File Queue
                            <span className="badge bg-secondary rounded-pill ms-2">
                                {filteredSortedJobIds.length}
                            </span>
                        </h6>
                    </div>
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                        {["all", "pending", "processing", "completed", "failed"].map((status) => (
                            <button
                                key={status}
                                className={`btn btn-sm btn-outline-${filter === status ? "primary" : "secondary"}`}
                                onClick={() => setFilter(status)}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="d-flex flex-wrap gap-4 align-items-center">
                    {/* Concurrency Toggle */}
                    {currentEngine === "whisper" && (
                        <div className="d-flex align-items-center gap-2">
                            <label className="form-label mb-0 small">Concurrency</label>
                            <select
                                className="form-select form-select-sm"
                                style={{ width: "80px" }}
                                value={whisperConcurrency}
                                onChange={(e) => setWhisperConcurrency(parseInt(e.target.value))}
                                disabled={safeMode}
                            >
                                {[...Array(10).keys()].map((i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                ))}
                            </select>
                            {!safeMode && (
                                <span className="badge bg-info text-dark small">
                                    Processing: {Object.values(jobs).filter(j => j.status === "processing" && j.engine === "whisper").length} / {whisperConcurrency}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Safe Mode Toggle */}
                    <div className="form-check form-switch d-flex align-items-center gap-2 mb-0">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="safeModeToggle"
                            checked={safeMode}
                            disabled={currentEngine === "gemini"}
                            onChange={() => currentEngine !== "gemini" && setSafeMode(!safeMode)}
                        />
                        <label className="form-check-label small mb-0" htmlFor="safeModeToggle">
                            Safe Mode {currentEngine === "gemini" && "(Required for Gemini)"}
                        </label>
                    </div>

                    {/* Auto Start Toggle */}
                    <div className="form-check form-switch d-flex align-items-center gap-2 mb-0">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="autoStartToggle"
                            checked={autoStart}
                            onChange={() => setAutoStart(!autoStart)}
                        />
                        <label className="form-check-label small mb-0" htmlFor="autoStartToggle">
                            Auto Start
                        </label>
                    </div>

                    {/* Auto Retry Toggle */}
                    <div className="form-check form-switch d-flex align-items-center gap-2 mb-0">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="autoRetryToggle"
                            checked={autoRetry}
                            onChange={() => setAutoRetry(!autoRetry)}
                        />
                        <label className="form-check-label small mb-0" htmlFor="autoRetryToggle">
                            Auto Retry
                        </label>
                    </div>
                </div>
            </div>

            <div className="card-body p-2">
                {filteredSortedJobIds.length === 0 ? (
                    <div className="text-muted small text-center py-3">
                        No jobs in this category.
                    </div>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                        <SortableContext
                            items={filteredSortedJobIds}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="row g-2" style={{ maxHeight: "300px", overflowY: "auto" }}>
                                {filteredSortedJobIds.map((id) => (
                                    <DraggableJobCard key={id} jobId={id} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </div>
    );
}
