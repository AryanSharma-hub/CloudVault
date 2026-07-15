const { S3Client } = require("@aws-sdk/client-s3");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { SNSClient } = require("@aws-sdk/client-sns");

const REGION = "us-east-1";

module.exports = {
    s3Client: new S3Client({ region: REGION }),
    dynamoClient: new DynamoDBClient({ region: REGION }),
    snsClient: new SNSClient({ region: REGION }),
    REGION
};