/**
 * services/notification/ConsoleNotificationService.js
 *
 * Local implementation of NotificationService. Simply logs messages to the
 * console (and through LoggingService) instead of sending real
 * notifications.
 *
 * ===========================================================================
 * AWS MIGRATION NOTE:
 * To migrate to Amazon SNS, create SNSNotificationService.js implementing
 * the same NotificationService interface (sendUploadNotification /
 * sendDownloadNotification / sendDeleteNotification) using the AWS SDK's
 * SNSClient.publish(), then flip PROVIDERS.NOTIFICATION to 'sns' in
 * config/constants.js (or the NOTIFICATION_PROVIDER env var). No other file
 * in the application needs to change.
 * ===========================================================================
 */

const NotificationService = require('./NotificationService');

class ConsoleNotificationService extends NotificationService {
  constructor(loggingService) {
    super();
    this.loggingService = loggingService;
  }

  sendUploadNotification(user, file) {
    const message = `Upload successful: "${file.originalName}" (${file.sizeFormatted}) uploaded by ${user.email}`;
    console.log(`\x1b[36m[NOTIFICATION]\x1b[0m ${message}`);
    this.loggingService.info(message, { type: 'upload_notification', userId: user.id, fileId: file.id });
  }

  sendDownloadNotification(user, file) {
    const message = `Downloaded successfully: "${file.originalName}" by ${user.email}`;
    console.log(`\x1b[36m[NOTIFICATION]\x1b[0m ${message}`);
    this.loggingService.info(message, { type: 'download_notification', userId: user.id, fileId: file.id });
  }

  sendDeleteNotification(user, file) {
    const message = `Deleted successfully: "${file.originalName}" by ${user.email}`;
    console.log(`\x1b[36m[NOTIFICATION]\x1b[0m ${message}`);
    this.loggingService.info(message, { type: 'delete_notification', userId: user.id, fileId: file.id });
  }
}

module.exports = ConsoleNotificationService;
