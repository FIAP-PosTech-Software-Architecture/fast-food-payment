import { PaymentWebhookRequest } from '#/interfaces/http/schemas/payment/payment-request.schema';

export interface IWebhookPaymentUseCase {
    execute(request: PaymentWebhookRequest): Promise<void>;
}
