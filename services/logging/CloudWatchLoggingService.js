function createNotificationService(loggingService) {

    switch (PROVIDERS.NOTIFICATION) {

        case 'sns':
            return new SNSNotificationService();

        case 'console':
            return new ConsoleNotificationService(loggingService);

        default:
            return new SNSNotificationService();
    }
}