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
        this.initialized = false;

        console.log("CLOUDWATCH LOGGER CREATED");
    }

    async initialize() {
        try {
            await this.client.send(
                new CreateLogStreamCommand({
                    logGroupName: this.logGroupName,
                    logStreamName: this.logStreamName,
                })
            );

            console.log(
                `Created CloudWatch log stream: ${this.logStreamName}`
            );
        } catch (err) {
            // Ignore if already exists
            if (
                err.name !== "ResourceAlreadyExistsException"
            ) {
                console.error("Failed creating log stream:", err);
            }
        }

        this.initialized = true;
    }

    async write(level, message, metadata = {}) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            const streams = await this.client.send(
                new DescribeLogStreamsCommand({
                    logGroupName: this.logGroupName,
                    logStreamNamePrefix: this.logStreamName,
                })
            );

            if (
                streams.logStreams &&
                streams.logStreams.length > 0
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
                putParams.sequenceToken =
                    this.sequenceToken;
            }

            const result = await this.client.send(
                new PutLogEventsCommand(putParams)
            );

            this.sequenceToken =
                result.nextSequenceToken;
        } catch (err) {
            console.error(
                "CloudWatch logging failed:",
                err
            );
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