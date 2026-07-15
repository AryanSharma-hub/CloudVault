/**
 * middleware/uploadMiddleware.js
 *
 * Configures multer to buffer uploads in memory (not directly to disk).
 * The buffer is then handed to StorageService by the controller/service
 * layer, keeping multer's disk/no-disk detail irrelevant to the rest of
 * the app and making a future S3 direct-buffer-upload trivial.
 */

const multer = require('multer');
const { UPLOAD } = require('../config/constants');

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const ext = require('path').extname(file.originalname).toLowerCase();
  const mimeOk = UPLOAD.ALLOWED_MIME_TYPES.includes(file.mimetype);
  const extOk = UPLOAD.ALLOWED_EXTENSIONS.includes(ext);

  if (mimeOk || extOk) {
    return cb(null, true);
  }
  const err = new Error(`File type not allowed: ${ext || file.mimetype}`);
  err.status = 400;
  return cb(err);
}

const upload = multer({
  storage,
  limits: { fileSize: UPLOAD.MAX_FILE_SIZE_BYTES },
  fileFilter,
});

module.exports = upload;
