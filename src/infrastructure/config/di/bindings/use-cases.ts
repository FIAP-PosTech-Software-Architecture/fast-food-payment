import { Container } from 'inversify';

import { CreatePayment } from '#/application/use-cases/payment/create-payment/create-payment';
import { ICreatePaymentUseCase } from '#/application/use-cases/payment/create-payment/create-payment.use-case';
import { GetPayment } from '#/application/use-cases/payment/get-payment/get-payment';
import { IGetPaymentUseCase } from '#/application/use-cases/payment/get-payment/get-payment.use-case';
import { WebhookPaymentUseCase } from '#/application/use-cases/payment/webhook-payment/webhook-payment';
import { IWebhookPaymentUseCase } from '#/application/use-cases/payment/webhook-payment/webhook-payment.use-case';
import { TYPES } from '#/infrastructure/config/di/types';

export function bindUseCases(container: Container) {
    container.bind<ICreatePaymentUseCase>(TYPES.CreatePaymentUseCase).to(CreatePayment).inTransientScope();
    container.bind<IGetPaymentUseCase>(TYPES.GetPaymentUseCase).to(GetPayment).inTransientScope();
    container.bind<IWebhookPaymentUseCase>(TYPES.WebhookUseCase).to(WebhookPaymentUseCase).inTransientScope();
}
