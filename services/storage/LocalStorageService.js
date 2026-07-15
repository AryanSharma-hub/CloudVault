/**
 * services/storage/LocalStorageService.js
 *
 * Local implementation of StorageService. Stores raw file bytes on disk
 * inside uploads/. This is the ONLY module in the entire application that
 * is allowed to touch the uploads/ folder directly.
 *
 * Files arrive here as an in-memory buffer (multer memoryStorage is used
 * upstream) precisely so that swapping to a network-based provider like S3
 * later is a drop-in change - no other code needs to know whether bytes
 * end up on a local disk or in an S3 bucket.
 *
 * ===========================================================================
 * AWS MIGRATION NOTE:
 * To migrate to Amazon S3, create S3StorageService.js implementing the same
 * StorageService interface (upload/download/delete/getFile/listFiles) using
 * the AWS SDK's S3Client (PutObjectCommand, GetObjectCommand,
 * DeleteObjectCommand, ListObjectsV2Command), then flip PROVIDERS.STORAGE to
 * 's3' in config/constants.js (or the STORAGE_PROVIDER env var). No other
 * file in the application needs to change.
 * ===========================================================================
 */

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const StorageService = require('./StorageService');
const { PATHS } = require('../../config/constants');

class LocalStorageService extends StorageService {
  constructor() {
    super();
    if (!fs.existsSync(PATHS.UPLOADS_DIR)) {
      fs.mkdirSync(PATHS.UPLOADS_DIR, { recursive: true });
    }
  }

  _resolvePath(storedName) {
    // Defend against path traversal - only allow the bare filename.
    const safeName = path.basename(storedName);
    return path.join(PATHS.UPLOADS_DIR, safeName);
  }

  /**
   * Persists a file buffer to disk under a unique stored name.
   * @param {{buffer: Buffer}} file - object containing the raw file buffer (e.g. from multer memoryStorage)
   * @param {string} uniqueName - pre-generated unique filename to store as
   */
  async upload(file, uniqueName) {
    const destPath = this._resolvePath(uniqueName);
    await fsp.writeFile(destPath, file.buffer);
    return { storedName: uniqueName, path: destPath };
  }

  /**
   * Returns the raw bytes for a stored file.
   */
  async download(storedName) {
    const filePath = this._resolvePath(storedName);
    return fsp.readFile(filePath);
  }

  /**
   * Removes a stored file from disk. Resolves silently if already absent.
   */
  async delete(storedName) {
    const filePath = this._resolvePath(storedName);
    try {
      await fsp.unlink(filePath);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
    return true;
  }

  /**
   * Returns metadata about the file on disk (existence + absolute path).
   * Used by controllers to stream a download response.
   */
  async getFile(storedName) {
    const filePath = this._resolvePath(storedName);
    const exists = fs.existsSync(filePath);
    return { exists, path: filePath };
  }

  /**
   * Local implementation doesn't need to enumerate the filesystem by user
   * (metadata already tracks ownership), but the method is implemented for
   * interface completeness / parity with a future S3 prefix-listing call.
   */
  async listFiles() {
    const files = await fsp.readdir(PATHS.UPLOADS_DIR);
    return files.filter((f) => f !== '.gitkeep');
  }
}

module.exports = LocalStorageService;
