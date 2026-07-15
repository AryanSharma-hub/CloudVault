/**
 * services/notification/NotificationService.js
 *
 * Abstract interface for notifications. Any concrete implementation (local
 * console, or later Amazon SNS) MUST implement these three methods with
 * the same signatures so it can be swapped in transparently via
 * ServiceFactory.
 */
class NotificationService {
  // eslint-disable-next-line no-unused-vars
  sendUploadNotification(user, file) {
    throw new Error('NotificationService.sendUploadNotification() must be implemented by subclass');
  }

  // eslint-disable-next-line no-unused-vars
  sendDownloadNotification(user, file) {
    throw new Error('NotificationService.sendDownloadNotification() must be implemented by subclass');
  }

  // eslint-disable-next-line no-unused-vars
  sendDeleteNotification(user, file) {
    throw new Error('NotificationService.sendDeleteNotification() must be implemented by subclass');
  }
}

module.exports = NotificationService;
