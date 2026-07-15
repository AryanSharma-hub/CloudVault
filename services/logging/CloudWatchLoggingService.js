const {
    CloudWatchLogsClient,
    CreateLogStreamCommand,
    PutLogEventsCommand,
    DescribeLogStreamsCommand,
} = require("@aws-sdk/client-cloudwatch-logs");

class CloudWatchLoggingService {
    constructor() {
        this.client = new CloudWatchLogsClient({
            region: "us-east-1",
        });

        this.logGroupName = "CloudVaultLogs";
        this.logStreamName = `cloudvault-${Date.now()}`;
        this.sequenceToken = null;

        console.log("CLOUDWATCH LOGGER CREATED");

        this.initialize();
    }

    async initialize() {
        try {
            await this.client.send(
                new CreateLogStreamCommand({
                    logGroupName: this.logGroupName,
                    logStreamName: this.logStreamName,
                })
            );
        } catch (err) {
            // ignore if stream already exists
        }
    }

    async write(level, message, metadata = {}) {
        try {
            const params = {
                logGroupName: this.logGroupName,
                logStreamName: this.logStreamName,
            };

            const streams = await this.client.send(
                new DescribeLogStreamsCommand(params)
            );

            if (
                streams.logStreams &&
                streams.logStreams.length > 0 &&
                streams.logStreams[0].uploadSequenceToken
            ) {
                this.sequenceToken =
                    streams.logStreams[0].uploadSequenceToken;
            }

            const logEvent = {
                message: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    level,
                    message,
                    metadata,
                }),
                timestamp: Date.now(),
            };

            const putParams = {
                logGroupName: this.logGroupName,
                logStreamName: this.logStreamName,
                logEvents: [logEvent],
            };

            if (this.sequenceToken) {
                putParams.sequenceToken = this.sequenceToken;
            }

            const result = await this.client.send(
                new PutLogEventsCommand(putParams)
            );

            this.sequenceToken = result.nextSequenceToken;
        } catch (err) {
            console.error("CloudWatch logging failed:", err);
        }
    }

    info(message, metadata = {}) {
        console.log(`[INFO] ${message}`);
        this.write("INFO", message, metadata);
    }

    warning(message, metadata = {}) {
        console.warn(`[WARNING] ${message}`);
        this.write("WARNING", message, metadata);
    }

    error(message, metadata = {}) {
        console.error(`[ERROR] ${message}`);
        this.write("ERROR", message, metadata);
    }
}

module.exports = CloudWatchLoggingService;