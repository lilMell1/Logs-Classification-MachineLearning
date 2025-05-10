  export const restrictedUserBlockedServices = [
    'MissionControlService',
    'BackupSchedulerService',
    'LoggerService',
    // 'AuditTrailService',
    // 'PermissionValidatorService',
    'KafkaConsumerService',
    'KafkaPublisherService',
    'CommandRelayService',
    'TelemetryProcessor',
    'KafkaBridgeService',
    'PayloadDecoder'
  ];

  
  export const restrictedUserAllowedServices = [
    'MonitoringService',
    'NotificationService',
    'RetryService',
    'ErrorHandlerService',
    'AlertDispatcherService'
  ];
  