import { inject, injectable } from 'inversify';

import { ICreatePaymentUseCase } from '#/application/use-cases/payment/create-payment/create-payment.use-case';
import { IGetPaymentUseCase } from '#/application/use-cases/payment/get-payment/get-payment.use-case';
import { IWebhookPaymentUseCase } from '#/application/use-cases/payment/webhook-payment/webhook-payment.use-case';
import { TYPES } from '#/infrastructure/config/di/types';
import { PaymentCreateRequest, PaymentWebhookRequest } from '#/interfaces/http/schemas/payment/payment-request.schema';
import { PaymentResponse } from '#/interfaces/http/schemas/payment/payment-response.schema';
import { PaymentPresenter } from '#/interfaces/presenter/payment.presenter';

@injectable()
export class PaymentController {
    constructor(
        @inject(TYPES.CreatePaymentUseCase) private readonly createPaymentUseCase: ICreatePaymentUseCase,
        @inject(TYPES.GetPaymentUseCase) private readonly getPaymentUseCase: IGetPaymentUseCase,
        @inject(TYPES.WebhookUseCase) private readonly webhookPaymentUseCase: IWebhookPaymentUseCase,
    ) {}

    async create(request: PaymentCreateRequest): Promise<PaymentResponse> {
        const response = await this.createPaymentUseCase.execute(request);
        return PaymentPresenter.toHTTP(response);
    }

    async get(id: string): Promise<PaymentResponse> {
        const response = await this.getPaymentUseCase.execute(id);
        return PaymentPresenter.toHTTP(response);
    }

    async webhook(payload: PaymentWebhookRequest): Promise<void> {
        await this.webhookPaymentUseCase.execute(payload);
    }
}
