import PropTypes from 'prop-types';
import JSZip from 'jszip';

export default function TranscriptActions({ job, allJobs }) {
  if (!job || !job.transcript) return null;

  const handleDownload = () => {
    const saveAsJson = document.getElementById('saveAsJson')?.checked;
    const { transcript, words = [], paragraph_breaks = [], name = 'transcript' } = job;

    let content = '';
    let ext = 'txt';

    if (words.length > 0 && saveAsJson) {
      content = JSON.stringify({ text: transcript, words, paragraph_breaks }, null, 2);
      ext = 'json';
    } else if (words.length > 0) {
      const paragraphs = [];
      let currentParagraph = [];

      words.forEach((word, index) => {
        if (paragraph_breaks.includes(index) && currentParagraph.length > 0) {
          paragraphs.push(currentParagraph);
          currentParagraph = [];
        }

        currentParagraph.push(word.word);

        if (
          currentParagraph.length >= 20 &&
          (index === words.length - 1 || words[index + 1].start - word.end > 0.5)
        ) {
          paragraphs.push(currentParagraph);
          currentParagraph = [];
        }
      });

      if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph);
      }

      content = paragraphs.map(p => p.join(' ')).join('\n\n');
    } else {
      content = transcript;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const baseName = name.replace(/\.[^/.]+$/, '');
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '_');
    const fileName = `${baseName}_transcript_${timestamp}.${ext}`;

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveAll = async () => {
    const zip = new JSZip();

    Object.values(allJobs).forEach((j) => {
      if (j.status === 'completed' && j.transcript) {
        const baseName = j.name.replace(/\.[^/.]+$/, '');
        const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '_');
        const fileName = `${baseName}_transcript_${timestamp}.txt`;
        zip.file(fileName, j.transcript);
      }
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcripts_batch_${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasMultipleCompleted = Object.values(allJobs).some(
    (j) => j.status === 'completed' && j.transcript
  );

  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="text-muted small">
          <i className="bi bi-download me-1"></i>
          Export transcript as plain text or JSON(Whisper Only)
        </div>

        <div className="d-flex flex-wrap gap-3 align-items-center">
          {job.words?.length > 0 && (
            <div className="form-check form-switch mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                id="saveAsJson"
                style={{ cursor: 'pointer' }}
              />
              <label className="form-check-label small text-muted" htmlFor="saveAsJson">
                JSON
              </label>
            </div>
          )}
          <button className="btn btn-sm btn-outline-success" onClick={handleDownload}>
            <i className="bi bi-download me-1"></i> Save
          </button>

          {hasMultipleCompleted && (
            <button className="btn btn-sm btn-outline-primary" onClick={handleSaveAll}>
              <i className="bi bi-archive me-1"></i> Save All Transcripts (.zip)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

TranscriptActions.propTypes = {
  job: PropTypes.shape({
    name: PropTypes.string,
    transcript: PropTypes.string,
    words: PropTypes.array,
    paragraph_breaks: PropTypes.array,
  }),
  allJobs: PropTypes.object.isRequired,
};
