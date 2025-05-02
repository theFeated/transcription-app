import { useRef } from "react";
import { useDropzone } from "react-dropzone";

export default function FileUpload({ onFilesSelected }) {
    const fileInputRef = useRef(null);

    const onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            onFilesSelected(acceptedFiles);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
        multiple: true,
        accept: {
            "audio/*": [],
            "video/*": []
        },
    });

    const triggerFileDialog = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="mb-3">
            <label className="form-label">Add Files to Queue</label>

            <div
                {...getRootProps()}
                className={`dropzone border rounded p-3 text-center ${isDragActive ? "bg-light border-primary" : "bg-white"}`}
                style={{ cursor: "pointer" }}
                onClick={triggerFileDialog}
            >
                <input {...getInputProps()} />
                <input
                    ref={fileInputRef}
                    type="file"
                    id="mediaFiles"
                    multiple
                    accept="audio/*,video/*"
                    style={{ display: "none" }}
                    onChange={(e) => onFilesSelected(e.target.files)}
                />

                <div className="d-flex flex-column align-items-center gap-2">
                    <i className="bi bi-upload" style={{ fontSize: "2rem" }}></i>
                    {isDragActive ? (
                        <p className="mb-0">Drop the files here...</p>
                    ) : (
                        <>
                            <p className="mb-0">
                                Drag & drop audio or video files here, or click to select
                            </p>
                            <small className="text-muted">Supports multiple files</small>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
