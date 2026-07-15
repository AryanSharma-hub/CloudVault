/**
 * services/logging/FileLoggingService.js
 *
 * Local implementation of LoggingService. Writes structured, timestamped
 * log lines to logs/application.log AND echoes them to the console.
 *
 * ===========================================================================
 * AWS MIGRATION NOTE:
 * To migrate to Amazon CloudWatch, create CloudWatchLoggingService.js that
 * implements the same LoggingService interface (info/warning/error) using
 * the AWS SDK's CloudWatchLogsClient, then flip PROVIDERS.LOGGING to
 * 'cloudwatch' in config/constants.js (or the LOGGING_PROVIDER env var).
 * No other file in the application needs to change.
 * ===========================================================================
 */

const fs = require('fs');
const path = require('path');
const LoggingService = require('./LoggingService');
const { PATHS } = require('../../config/constants');

class FileLoggingService extends LoggingService {
  constructor() {
    super();
    const logDir = path.dirname(PATHS.LOG_FILE);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  _write(level, message, meta) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    const line = `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}\n`;

    // Console echo for real-time visibility during development.
    const consoleFn = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log;
    consoleFn(line.trim());

    // Persist to file (append-only).
    fs.appendFile(PATHS.LOG_FILE, line, (err) => {
      if (err) {
        // Avoid infinite loop by not calling this.error() here.
        console.error('Failed to write to log file:', err.message);
      }
    });
  }

  info(message, meta = {}) {
    this._write('info', message, meta);
  }

  warning(message, meta = {}) {
    this._write('warning', message, meta);
  }

  error(message, meta = {}) {
    this._write('error', message, meta);
  }
}

module.exports = FileLoggingService;
