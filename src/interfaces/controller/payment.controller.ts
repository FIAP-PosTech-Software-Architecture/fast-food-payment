import { inject, injectable } from 'inversify';

import { ICreatePaymentUseCase } from '#/application/use-cases/payment/create-payment/create-payment.use-case';
import { IGetPaymentUseCase } from '#/application/use-cases/payment/get-payment/get-payment.use-case';
import { IWebhookPaymentUseCase } from '#/application/use-cases/payment/webhook-payment/webhook-payment.use-case';
import { ILogger } from '#/domain/services/logger.service';
import { TYPES } from '#/infrastructure/config/di/types';
import { PaymentCreateRequest, PaymentWebhookRequest } from '#/interfaces/http/schemas/payment/payment-request.schema';
import { PaymentResponse } from '#/interfaces/http/schemas/payment/payment-response.schema';
import { PaymentPresenter } from '#/interfaces/presenter/payment.presenter';

@injectable()
export class PaymentController {
    constructor(
        @inject(TYPES.Logger) private readonly logger: ILogger,
        @inject(TYPES.CreatePaymentUseCase) private readonly createPaymentUseCase: ICreatePaymentUseCase,
        @inject(TYPES.GetPaymentUseCase) private readonly getPaymentUseCase: IGetPaymentUseCase,
        @inject(TYPES.WebhookUseCase) private readonly webhookPaymentUseCase: IWebhookPaymentUseCase,
    ) {}

    async create(request: PaymentCreateRequest): Promise<PaymentResponse> {
        this.logger.info('Creating a new payment', { request });
        const response = await this.createPaymentUseCase.execute(request);
        return PaymentPresenter.toHTTP(response);
    }

    async get(id: string): Promise<PaymentResponse> {
        this.logger.info('Retrieving payment with ID', { id });
        const response = await this.getPaymentUseCase.execute(id);
        return PaymentPresenter.toHTTP(response);
    }

    async webhook(payload: PaymentWebhookRequest): Promise<void> {
        this.logger.info('Webhook received payload', { payload });
        await this.webhookPaymentUseCase.execute(payload);
    }
}
