/**
 * repositories/fileRepository.js
 *
 * Direct SQLite access for the `files` table (file METADATA only - never
 * touches the actual bytes on disk, that is StorageService's job).
 * SQLiteMetadataService is the only consumer of this repository.
 */

const { db } = require('../config/database');

const fileRepository = {
  create({ userId, originalName, storedName, fileType, mimeType, sizeBytes }) {
    const stmt = db.prepare(`
      INSERT INTO files (user_id, original_name, stored_name, file_type, mime_type, size_bytes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(userId, originalName, storedName, fileType, mimeType, sizeBytes);
    return this.findById(info.lastInsertRowid);
  },

  findById(id) {
    const stmt = db.prepare('SELECT * FROM files WHERE id = ?');
    return stmt.get(id);
  },

  findAllByUser(userId) {
    const stmt = db.prepare('SELECT * FROM files WHERE user_id = ? ORDER BY uploaded_at DESC');
    return stmt.all(userId);
  },

  searchByUser(userId, query) {
    const stmt = db.prepare(`
      SELECT * FROM files
      WHERE user_id = ? AND original_name LIKE ?
      ORDER BY uploaded_at DESC
    `);
    return stmt.all(userId, `%${query}%`);
  },

  deleteById(id) {
    const stmt = db.prepare('DELETE FROM files WHERE id = ?');
    return stmt.run(id);
  },

  incrementDownloadCount(id) {
    const stmt = db.prepare('UPDATE files SET download_count = download_count + 1 WHERE id = ?');
    stmt.run(id);
    return this.findById(id);
  },

  getStatsByUser(userId) {
    const stmt = db.prepare(`
      SELECT COUNT(*) AS total_files,
             COALESCE(SUM(size_bytes), 0) AS total_size,
             COALESCE(SUM(download_count), 0) AS total_downloads
      FROM files WHERE user_id = ?
    `);
    return stmt.get(userId);
  },
};

module.exports = fileRepository;
