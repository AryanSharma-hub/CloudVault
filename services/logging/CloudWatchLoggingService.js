const LoggingService = require('./LoggingService');
const WinstonCloudWatch = require('winston-cloudwatch');
const winston = require('winston');

class CloudWatchLoggingService extends LoggingService {

    constructor() {
        super();

        this.logger = winston.createLogger({
            transports: [
                new WinstonCloudWatch({
                    logGroupName: 'CloudVaultLogs',
                    logStreamName: 'CloudVaultStream',
                    awsRegion: 'us-east-1'
                })
            ]
        });
    }

    info(message, meta = {}) {
        this.logger.info(message, meta);
    }

    warning(message, meta = {}) {
        this.logger.warn(message, meta);
    }

    error(message, meta = {}) {
        this.logger.error(message, meta);
    }
}

module.exports = CloudWatchLoggingService;