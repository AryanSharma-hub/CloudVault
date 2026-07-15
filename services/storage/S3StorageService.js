const StorageService = require("./StorageService");

const {
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
    HeadObjectCommand
} = require("@aws-sdk/client-s3");

const { s3Client } = require("../../config/aws");

const BUCKET_NAME = "cloudvault-aryansharma-2026";

class S3StorageService extends StorageService {

    async upload(file, uniqueName) {

        await s3Client.send(
            new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: uniqueName,
                Body: file.buffer,
                ContentType: file.mimetype
            })
        );

        return {
            storedName: uniqueName,
            key: uniqueName
        };
    }

    async download(storedName) {

        const response = await s3Client.send(
            new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: storedName
            })
        );

        const chunks = [];

        for await (const chunk of response.Body) {
            chunks.push(chunk);
        }

        return Buffer.concat(chunks);
    }

    async delete(storedName) {

        await s3Client.send(
            new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: storedName
            })
        );

        return true;
    }

    async getFile(storedName) {

        try {

            await s3Client.send(
                new HeadObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: storedName
                })
            );

            return {
                exists: true,
                key: storedName
            };

        } catch {

            return {
                exists: false
            };

        }
    }

    async listFiles() {

        const result = await s3Client.send(
            new ListObjectsV2Command({
                Bucket: BUCKET_NAME
            })
        );

        return (result.Contents || []).map(
            item => item.Key
        );
    }
}

module.exports = S3StorageService;