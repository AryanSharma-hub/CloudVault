/**
 * services/metadata/SQLiteMetadataService.js
 *
 * Local implementation of MetadataService, backed by SQLite via the
 * repository layer. This is the ONLY service allowed to talk to
 * userRepository/fileRepository. Controllers never see SQL.
 *
 * ===========================================================================
 * AWS MIGRATION NOTE:
 * To migrate to Amazon DynamoDB, create DynamoDBMetadataService.js
 * implementing the same MetadataService interface using the AWS SDK's
 * DynamoDBClient / DocumentClient, then flip PROVIDERS.METADATA to
 * 'dynamodb' in config/constants.js (or the METADATA_PROVIDER env var).
 * No other file in the application needs to change.
 * ===========================================================================
 */

const MetadataService = require('./MetadataService');
const fileRepository = require('../../repositories/fileRepository');
const userRepository = require('../../repositories/userRepository');
const FileModel = require('../../models/File');
const User = require('../../models/User');

class SQLiteMetadataService extends MetadataService {
  async saveMetadata({ userId, originalName, storedName, fileType, mimeType, sizeBytes }) {
    const row = fileRepository.create({ userId, originalName, storedName, fileType, mimeType, sizeBytes });
    return new FileModel(row);
  }

  async getMetadata(fileId) {
    const row = fileRepository.findById(fileId);
    return row ? new FileModel(row) : null;
  }

  async listFiles(userId, searchQuery = null) {
    const rows = searchQuery
      ? fileRepository.searchByUser(userId, searchQuery)
      : fileRepository.findAllByUser(userId);
    return rows.map((row) => new FileModel(row));
  }

  async deleteMetadata(fileId) {
    return fileRepository.deleteById(fileId);
  }

  async updateDownloadCount(fileId) {
    const row = fileRepository.incrementDownloadCount(fileId);
    return row ? new FileModel(row) : null;
  }

  async getUserStats(userId) {
    const stats = fileRepository.getStatsByUser(userId);
    return {
      totalFiles: stats.total_files,
      totalSizeBytes: stats.total_size,
      totalDownloads: stats.total_downloads,
    };
  }

  async createUser({ firstName, lastName, email, passwordHash }) {
    const row = userRepository.create({ firstName, lastName, email, passwordHash });
    return new User(row);
  }

  async getUserByEmail(email) {
    const row = userRepository.findByEmail(email);
    return row ? new User(row) : null;
  }

  async getUserById(id) {
    const row = userRepository.findById(id);
    return row ? new User(row) : null;
  }
}

module.exports = SQLiteMetadataService;
