import { useState, useEffect } from 'react';
import { getAllJobs, saveJob, deleteJob, clearJobs } from '../utils/indexeddb';

export function usePersistedJobs() {
  const [jobs, setJobs] = useState({});
  const [activeJobId, setActiveJobId] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);

  // Load from IndexedDB + localStorage
  useEffect(() => {
    (async () => {
      const stored = await getAllJobs();
      const restored = {};
      stored.forEach((job) => {
        if (job.file && typeof job.file === 'object') {
          job.file = new File([job.file], job.name, { type: job.file.type });
        }
        job.mode = job.mode || "default"; // <-- Add this line
        restored[job.id] = job;
      });
      setJobs(restored);
      setActiveJobId(localStorage.getItem("activeJobId"));
      setCurrentTime(parseFloat(localStorage.getItem("audioCurrentTime") || "0"));
    })();
  }, []);

  // Auto-persist jobs
  useEffect(() => {
    Object.values(jobs).forEach((job) => {
      if (job.file) saveJob(job); // mode is included automatically
    });
  }, [jobs]);

  // Persist activeJobId
  useEffect(() => {
    if (activeJobId) {
      localStorage.setItem("activeJobId", activeJobId);
    } else {
      localStorage.removeItem("activeJobId");
    }
  }, [activeJobId]);

  // Persist audio position
  useEffect(() => {
    localStorage.setItem("audioCurrentTime", currentTime.toString());
  }, [currentTime]);

  const removeJob = async (id) => {
    await deleteJob(id);
    setJobs((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    if (id === activeJobId) {
      setActiveJobId(null);
      setCurrentTime(0);
    }
  };

  const resetAllJobs = async () => {
    await clearJobs();
    setJobs({});
    setActiveJobId(null);
    setCurrentTime(0);
  };

  const activeJob = jobs[activeJobId] || null;

  return {
    jobs,
    setJobs,
    removeJob,
    resetAllJobs,
    activeJob,
    setActiveJobId,
    currentTime,
    setCurrentTime,
  };
}
