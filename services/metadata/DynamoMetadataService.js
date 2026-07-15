const MetadataService = require('./MetadataService');

const { DynamoDBDocumentClient,
    PutCommand,
    QueryCommand,
    GetCommand,
    DeleteCommand,
    UpdateCommand
} = require('@aws-sdk/lib-dynamodb');

const { dynamoClient } = require('../../config/aws');

const TABLE_NAME = 'CloudVaultFilesV2';

const docClient =
    DynamoDBDocumentClient.from(dynamoClient);

class DynamoMetadataService extends MetadataService {

    async saveMetadata({
        userId,
        originalName,
        storedName,
        fileType,
        mimeType,
        sizeBytes
    }) {

        const fileId = Date.now().toString();

        const item = {
            userID: String(userId),
            fileID: fileId,
            originalName,
            storedName,
            fileType,
            mimeType,
            sizeBytes,
            downloadCount: 0,
            uploadedAt: new Date().toISOString()
        };

        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: item
            })
        );

        return item;
    }

    async getMetadata(fileId) {

        return null;
    }

    async listFiles(userId) {

        const result = await docClient.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression:
                    'userID = :uid',

                ExpressionAttributeValues: {
                    ':uid': String(userId)
                }
            })
        );

        return result.Items || [];
    }

    async deleteMetadata(fileId) {
        return true;
    }

    async updateDownloadCount(fileId) {
        return true;
    }

    async getUserStats(userId) {

        const files = await this.listFiles(userId);

        return {
            totalFiles: files.length,
            totalSizeBytes:
                files.reduce(
                    (sum, f) => sum + (f.sizeBytes || 0),
                    0
                ),
            totalDownloads:
                files.reduce(
                    (sum, f) => sum + (f.downloadCount || 0),
                    0
                )
        };
    }
}

module.exports = DynamoMetadataService;