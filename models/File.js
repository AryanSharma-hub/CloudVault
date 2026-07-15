/**
 * models/File.js
 * Plain data model representing an uploaded file's metadata.
 */
class FileModel {
  constructor(row) {
    this.id = row.id;
    this.userId = row.user_id;
    this.originalName = row.original_name;
    this.storedName = row.stored_name;
    this.fileType = row.file_type;
    this.mimeType = row.mime_type;
    this.sizeBytes = row.size_bytes;
    this.downloadCount = row.download_count;
    this.uploadedAt = row.uploaded_at;
  }

  get sizeFormatted() {
    const bytes = this.sizeBytes;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  toSafeObject() {
    return {
      id: this.id,
      userId: this.userId,
      originalName: this.originalName,
      fileType: this.fileType,
      mimeType: this.mimeType,
      sizeBytes: this.sizeBytes,
      sizeFormatted: this.sizeFormatted,
      downloadCount: this.downloadCount,
      uploadedAt: this.uploadedAt,
    };
  }
}

module.exports = FileModel;
