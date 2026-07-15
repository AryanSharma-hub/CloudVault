const NotificationService = require('./NotificationService');

const {
    PublishCommand
} = require('@aws-sdk/client-sns');

const { snsClient } = require('../../config/aws');

const TOPIC_ARN =
    'arn:aws:sns:us-east-1:075295381571:CloudVaultNotifications';

class SNSNotificationService extends NotificationService {

    async publish(message) {

        await snsClient.send(
            new PublishCommand({
                TopicArn: TOPIC_ARN,
                Message: message
            })
        );
    }

    sendUploadNotification(user, file) {

        return this.publish(
            `UPLOAD: ${user.email} uploaded ${file.originalName}`
        );
    }

    sendDownloadNotification(user, file) {

        return this.publish(
            `DOWNLOAD: ${user.email} downloaded ${file.originalName}`
        );
    }

    sendDeleteNotification(user, file) {

        return this.publish(
            `DELETE: ${user.email} deleted ${file.originalName}`
        );
    }
}

module.exports = SNSNotificationService;