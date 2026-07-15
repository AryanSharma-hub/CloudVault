/**
 * config/constants.js
 *
 * Centralized application configuration.
 *
 * NOTE ON AWS MIGRATION:
 * The `PROVIDER` flags below are the ONLY switches that need to change
 * when moving to AWS. The ServiceFactory (services/serviceFactory.js)
 * reads these flags to decide which concrete implementation to
 * instantiate for each service interface. Controllers/Routes/Views never
 * know or care which implementation is active.
 */

require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  SESSION_SECRET: process.env.SESSION_SECRET || 'cloudvault-dev-secret-change-in-production',

  // Provider switches - change these (or the related env vars) to migrate to AWS later.
  PROVIDERS: {
    STORAGE: process.env.STORAGE_PROVIDER || 's3', // 'local' | 's3'
    METADATA: process.env.METADATA_PROVIDER || 'sqlite', // 'sqlite' | 'dynamodb'
    NOTIFICATION: process.env.NOTIFICATION_PROVIDER || 'sns', // 'console' | 'sns'
    LOGGING: process.env.LOGGING_PROVIDER || 'file', // 'file' | 'cloudwatch'
  },

  UPLOAD: {
    MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024, // 50 MB
    ALLOWED_MIME_TYPES: [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
      'application/zip',
      'application/x-zip-compressed',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
    ALLOWED_EXTENSIONS: ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.zip', '.txt', '.docx', '.doc', '.pptx', '.ppt'],
  },

  PATHS: {
    UPLOADS_DIR: require('path').join(__dirname, '..', 'uploads'),
    DATABASE_FILE: require('path').join(__dirname, '..', 'database', 'cloudvault.db'),
    LOG_FILE: require('path').join(__dirname, '..', 'logs', 'application.log'),
  },
};
