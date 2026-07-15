/**
 * services/metadata/MetadataService.js
 *
 * Abstract interface for file metadata persistence. Any concrete
 * implementation (local SQLite, or later Amazon DynamoDB) MUST implement
 * these methods with the same signatures so it can be swapped in
 * transparently via ServiceFactory. Business logic (controllers) only ever
 * talks to this interface - never to SQL or a specific database driver.
 */
class MetadataService {
  // eslint-disable-next-line no-unused-vars
  async saveMetadata({ userId, originalName, storedName, fileType, mimeType, sizeBytes }) {
    throw new Error('MetadataService.saveMetadata() must be implemented by subclass');
  }

  // eslint-disable-next-line no-unused-vars
  async getMetadata(fileId) {
    throw new Error('MetadataService.getMetadata() must be implemented by subclass');
  }

  // eslint-disable-next-line no-unused-vars
  async listFiles(userId, searchQuery = null) {
    throw new Error('MetadataService.listFiles() must be implemented by subclass');
  }

  // eslint-disable-next-line no-unused-vars
  async deleteMetadata(fileId) {
    throw new Error('MetadataService.deleteMetadata() must be implemented by subclass');
  }

  // eslint-disable-next-line no-unused-vars
  async updateDownloadCount(fileId) {
    throw new Error('MetadataService.updateDownloadCount() must be implemented by subclass');
  }

  // eslint-disable-next-line no-unused-vars
  async getUserStats(userId) {
    throw new Error('MetadataService.getUserStats() must be implemented by subclass');
  }

  // --- User account metadata (kept in the same service for simplicity) ---

  // eslint-disable-next-line no-unused-vars
  async createUser({ firstName, lastName, email, passwordHash }) {
    throw new Error('MetadataService.createUser() must be implemented by subclass');
  }

  // eslint-disable-next-line no-unused-vars
  async getUserByEmail(email) {
    throw new Error('MetadataService.getUserByEmail() must be implemented by subclass');
  }

  // eslint-disable-next-line no-unused-vars
  async getUserById(id) {
    throw new Error('MetadataService.getUserById() must be implemented by subclass');
  }
}

module.exports = MetadataService;
