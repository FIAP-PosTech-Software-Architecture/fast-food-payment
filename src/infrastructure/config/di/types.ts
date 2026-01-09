export const TYPES = {
    // Database
    PrismaClient: Symbol.for('PrismaClient'),

    // Repositories
    PaymentRepository: Symbol.for('PaymentRepository'),

    // Controllers
    PaymentController: Symbol.for('PaymentController'),

    // Use Cases
    CreatePaymentUseCase: Symbol.for('CreatePaymentUseCase'),
    GetPaymentUseCase: Symbol.for('GetPaymentUseCase'),
    WebhookUseCase: Symbol.for('WebhookUseCase'),

    // Gateway
    OrderPaymentsApprovedGateway: Symbol.for('OrderPaymentsApprovedGateway'),
    OrderPaymentsFailedGateway: Symbol.for('OrderPaymentsFailedGateway'),
    CreatePaymentGateway: Symbol.for('CreatePaymentGateway'),
    GetPaymentGateway: Symbol.for('GetPaymentGateway'),

    // Services
    HttpClientService: Symbol.for('HttpClientService'),
    Logger: Symbol.for('Logger'),
} as const;
