/**
 * utils/helpers.js
 * Small, reusable, side-effect-free helper functions.
 */

const crypto = require('crypto');
const path = require('path');

/**
 * Generates a unique, filesystem-safe filename that preserves the original
 * extension, e.g. "report.pdf" -> "1719999999999-9f2a1c3b.pdf"
 */
function generateUniqueFilename(originalName) {
  const ext = path.extname(originalName);
  const randomPart = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${randomPart}${ext}`;
}

/**
 * Derives a short, human-friendly file-type label (e.g. "PDF", "ZIP")
 * from a filename's extension.
 */
function getFileTypeLabel(filename) {
  const ext = path.extname(filename).replace('.', '').toUpperCase();
  return ext || 'FILE';
}

/**
 * Maps a file-type label to a Bootstrap Icon class for the UI.
 */
function getFileIcon(fileType) {
  const map = {
    PDF: 'bi-file-earmark-pdf-fill text-danger',
    ZIP: 'bi-file-earmark-zip-fill text-warning',
    TXT: 'bi-file-earmark-text-fill text-secondary',
    DOCX: 'bi-file-earmark-word-fill text-primary',
    DOC: 'bi-file-earmark-word-fill text-primary',
    PPTX: 'bi-file-earmark-ppt-fill text-danger',
    PPT: 'bi-file-earmark-ppt-fill text-danger',
    PNG: 'bi-file-earmark-image-fill text-success',
    JPG: 'bi-file-earmark-image-fill text-success',
    JPEG: 'bi-file-earmark-image-fill text-success',
    GIF: 'bi-file-earmark-image-fill text-success',
    WEBP: 'bi-file-earmark-image-fill text-success',
  };
  return map[fileType] || 'bi-file-earmark-fill text-muted';
}

/**
 * Formats a byte count into a human-readable string.
 */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * Formats an ISO/SQLite datetime string into something friendlier for the UI.
 */
function formatDate(dateString) {
  const date = new Date(dateString.replace(' ', 'T') + 'Z');
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

module.exports = {
  generateUniqueFilename,
  getFileTypeLabel,
  getFileIcon,
  formatBytes,
  formatDate,
};
