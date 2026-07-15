/**
 * services/logging/LoggingService.js
 *
 * Abstract interface for logging. Any concrete implementation (local file,
 * or later Amazon CloudWatch) MUST implement these three methods with the
 * same signatures so it can be swapped in transparently via ServiceFactory.
 */
class LoggingService {
  // eslint-disable-next-line no-unused-vars
  info(message, meta = {}) {
    throw new Error('LoggingService.info() must be implemented by subclass');
  }

  // eslint-disable-next-line no-unused-vars
  warning(message, meta = {}) {
    throw new Error('LoggingService.warning() must be implemented by subclass');
  }

  // eslint-disable-next-line no-unused-vars
  error(message, meta = {}) {
    throw new Error('LoggingService.error() must be implemented by subclass');
  }
}

module.exports = LoggingService;
