/**
 * services/storage/StorageService.js
 *
 * Abstract interface for raw file byte storage. Any concrete
 * implementation (local disk, or later Amazon S3) MUST implement these
 * methods with the same signatures so it can be swapped in transparently
 * via ServiceFactory. The uploads/ folder is NEVER accessed directly by
 * anything outside this service's local implementation.
 */
class StorageService {
  // eslint-disable-next-line no-unused-vars
  async upload(file, uniqueName) {
    throw new Error('StorageService.upload() must be implemented by subclass');
  }

  // eslint-disable-next-line no-unused-vars
  async download(storedName) {
    throw new Error('StorageService.download() must be implemented by subclass');
  }

  // eslint-disable-next-line no-unused-vars
  async delete(storedName) {
    throw new Error('StorageService.delete() must be implemented by subclass');
  }

  // eslint-disable-next-line no-unused-vars
  async getFile(storedName) {
    throw new Error('StorageService.getFile() must be implemented by subclass');
  }

  // eslint-disable-next-line no-unused-vars
  async listFiles(userId) {
    throw new Error('StorageService.listFiles() must be implemented by subclass');
  }
}

module.exports = StorageService;
