/**
 * services/serviceFactory.js
 *
 * ===========================================================================
 * THIS IS THE SINGLE MOST IMPORTANT FILE FOR THE AWS MIGRATION STORY.
 * ===========================================================================
 *
 * Every controller/business-logic module obtains its services from here,
 * never by `require`-ing a concrete implementation directly. This factory
 * reads config/constants.js#PROVIDERS and instantiates the correct concrete
 * class for each interface (Storage / Metadata / Notification / Logging).
 *
 * To migrate any piece to AWS:
 *   1. Write the new class (e.g. S3StorageService) that extends/implements
 *      the same interface (e.g. StorageService) with identical method
 *      signatures.
 *   2. Add a branch for it below.
 *   3. Flip the relevant flag in config/constants.js (or its env var).
 *
 * Nothing in controllers/, routes/, middleware/, or views/ needs to change.
 */

const { PROVIDERS } = require('../config/constants');

// Logging
const FileLoggingService = require('./logging/FileLoggingService');
// const CloudWatchLoggingService = require('./logging/CloudWatchLoggingService'); // <-- future AWS impl

// Notification
const ConsoleNotificationService = require('./notification/ConsoleNotificationService');
// const SNSNotificationService = require('./notification/SNSNotificationService'); // <-- future AWS impl

// Metadata
const SQLiteMetadataService = require('./metadata/SQLiteMetadataService');
const DynamoMetadataService = require('./metadata/DynamoMetadataService'); // <-- future AWS impl

// Storage
const S3StorageService = require("./storage/S3StorageService");
// const S3StorageService = require('./storage/S3StorageService'); // <-- future AWS impl

function createLoggingService() {
  switch (PROVIDERS.LOGGING) {
    case 'file':
      return new FileLoggingService();
    // case 'cloudwatch':
    //   return new CloudWatchLoggingService();
    default:
      return new FileLoggingService();
  }
}

function createNotificationService(loggingService) {
  switch (PROVIDERS.NOTIFICATION) {
    case 'console':
      return new ConsoleNotificationService(loggingService);
    // case 'sns':
    //   return new SNSNotificationService(loggingService);
    default:
      return new ConsoleNotificationService(loggingService);
  }
}

function createMetadataService() {
  switch (PROVIDERS.METADATA) {

    case 'sqlite':
      return new SQLiteMetadataService();

    case 'dynamodb':
      return new DynamoMetadataService();

    default:
      return new DynamoMetadataService();
  }
}

function createStorageService() {
  switch (PROVIDERS.STORAGE) {

    case 's3':
      return new S3StorageService();

    case 'local':
    default:
      return new LocalStorageService();
  }
}

// Singletons - instantiated once and shared across the app (each concrete
// implementation is stateless or manages its own connection pooling).
const loggingService = createLoggingService();
const notificationService = createNotificationService(loggingService);
const metadataService = createMetadataService();
const storageService = createStorageService();

module.exports = {
  loggingService,
  notificationService,
  metadataService,
  storageService,
};
