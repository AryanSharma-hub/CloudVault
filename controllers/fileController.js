/**
 * controllers/fileController.js
 *
 * Orchestrates file operations by calling into the service layer only:
 * StorageService (bytes), MetadataService (DB records), NotificationService
 * (post-action messages), and LoggingService (audit trail). This controller
 * never touches SQLite or the uploads/ folder directly.
 */

const path = require('path');
const {
  storageService,
  metadataService,
  notificationService,
  loggingService,
} = require('../services/serviceFactory');
const { generateUniqueFilename, getFileTypeLabel, getFileIcon, formatBytes, formatDate } = require('../utils/helpers');

exports.dashboard = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const files = await metadataService.listFiles(userId);
    const stats = await metadataService.getUserStats(userId);

    const filesForView = files.slice(0, 5).map(decorateFile);

    return res.render('dashboard', {
      title: 'Dashboard',
      user: req.session.user,
      recentFiles: filesForView,
      stats: {
        totalFiles: stats.totalFiles,
        totalSizeFormatted: formatBytes(stats.totalSizeBytes),
        totalDownloads: stats.totalDownloads,
      },
      flashSuccess: consumeFlash(req, 'flashSuccess'),
      flashError: consumeFlash(req, 'flashError'),
    });
  } catch (err) {
    return next(err);
  }
};

exports.listFilesPage = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const searchQuery = req.query.q ? req.query.q.trim() : null;
    const files = await metadataService.listFiles(userId, searchQuery);

    return res.render('files', {
      title: 'My Files',
      user: req.session.user,
      files: files.map(decorateFile),
      searchQuery: searchQuery || '',
      flashSuccess: consumeFlash(req, 'flashSuccess'),
      flashError: consumeFlash(req, 'flashError'),
    });
  } catch (err) {
    return next(err);
  }
};

// JSON endpoint used by the client-side instant search box.
exports.searchFilesApi = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const searchQuery = req.query.q ? req.query.q.trim() : null;
    const files = await metadataService.listFiles(userId, searchQuery);
    return res.json({ success: true, files: files.map(decorateFile) });
  } catch (err) {
    return next(err);
  }
};

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      req.session.flashError = 'Please select a file to upload.';
      return res.redirect('/dashboard');
    }

    const userId = req.session.userId;
    const originalName = req.file.originalname;
    const uniqueName = generateUniqueFilename(originalName);
    const fileType = getFileTypeLabel(originalName);

    // 1. Persist bytes via StorageService (local disk today, S3 tomorrow).
    await storageService.upload(req.file, uniqueName);

    // 2. Persist metadata via MetadataService (SQLite today, DynamoDB tomorrow).
    const fileRecord = await metadataService.saveMetadata({
      userId,
      originalName,
      storedName: uniqueName,
      fileType,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    });

    // 3. Notify.
    notificationService.sendUploadNotification(req.session.user, fileRecord);

    // 4. Log.
    loggingService.info('File uploaded', {
      userId,
      fileId: fileRecord.id,
      originalName,
      sizeBytes: fileRecord.sizeBytes,
    });

    req.session.flashSuccess = `"${originalName}" uploaded successfully.`;
    return res.redirect('/dashboard');
  } catch (err) {
    return next(err);
  }
};

exports.downloadFile = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const fileId = Number(req.params.id);
    const fileRecord = await metadataService.getMetadata(fileId);

    if (!fileRecord || fileRecord.userId !== userId) {
      loggingService.warning('Attempted download of missing/unauthorized file', { userId, fileId });
      req.session.flashError = 'File not found.';
      return res.redirect('/files');
    }

    const fileInfo = await storageService.getFile(fileRecord.storedName);
    if (!fileInfo.exists) {
      loggingService.error('File metadata exists but bytes missing from storage', { fileId, storedName: fileRecord.storedName });
      req.session.flashError = 'File is missing from storage. Please contact support.';
      return res.redirect('/files');
    }

    await metadataService.updateDownloadCount(fileId);
    notificationService.sendDownloadNotification(req.session.user, fileRecord);
    loggingService.info('File downloaded', { userId, fileId });

    return res.download(fileInfo.path, fileRecord.originalName);
  } catch (err) {
    return next(err);
  }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const fileId = Number(req.params.id);
    const fileRecord = await metadataService.getMetadata(fileId);

    if (!fileRecord || fileRecord.userId !== userId) {
      loggingService.warning('Attempted delete of missing/unauthorized file', { userId, fileId });
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    await storageService.delete(fileRecord.storedName);
    await metadataService.deleteMetadata(fileId);

    notificationService.sendDeleteNotification(req.session.user, fileRecord);
    loggingService.info('File deleted', { userId, fileId, originalName: fileRecord.originalName });

    return res.json({ success: true, message: `"${fileRecord.originalName}" was deleted.` });
  } catch (err) {
    return next(err);
  }
};

// --- helpers ---

function decorateFile(file) {
  const safe = file.toSafeObject();
  return {
    ...safe,
    icon: getFileIcon(safe.fileType),
    uploadedAtFormatted: formatDate(safe.uploadedAt),
  };
}

function consumeFlash(req, key) {
  const value = req.session[key];
  req.session[key] = null;
  return value;
}
