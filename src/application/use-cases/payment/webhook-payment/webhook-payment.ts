import { StatusPayment } from '@prisma/client';
import { inject, injectable } from 'inversify';

import { IWebhookPaymentUseCase } from '#/application/use-cases/payment/webhook-payment/webhook-payment.use-case';
import { NotFoundError } from '#/domain/errors';
import { IOrderPaymentsApproved } from '#/domain/gateways/order/order-payments-approved';
import { IOrderPaymentsFailed } from '#/domain/gateways/order/order-payments-failed';
import { IGetPayment } from '#/domain/gateways/payment/get-payment';
import { IPaymentRepository } from '#/domain/repositories/payment.repository';
import { ILogger } from '#/domain/services/logger.service';
import { TYPES } from '#/infrastructure/config/di/types';
import { PaymentWebhookRequest } from '#/interfaces/http/schemas/payment/payment-request.schema';

const statusPayment: Record<string, StatusPayment> = {
    pending: StatusPayment.PENDING,
    approved: StatusPayment.APPROVED,
    rejected: StatusPayment.REJECTED,
};

@injectable()
export class WebhookPaymentUseCase implements IWebhookPaymentUseCase {
    constructor(
        @inject(TYPES.Logger) private readonly logger: ILogger,
        @inject(TYPES.GetPaymentGateway) private readonly getPaymentGateway: IGetPayment,
        @inject(TYPES.PaymentRepository) private readonly paymentRepository: IPaymentRepository,
        @inject(TYPES.OrderPaymentsApprovedGateway) private readonly orderPaymentsApproved: IOrderPaymentsApproved,
        @inject(TYPES.OrderPaymentsFailedGateway) private readonly orderPaymentsFailed: IOrderPaymentsFailed,
    ) {}

    async execute(request: PaymentWebhookRequest): Promise<void> {
        const gateway = await this.getPaymentGateway.execute(request.data.id);
        this.logger.info('Webhook received:', gateway);

        const payment = await this.paymentRepository.findById(gateway.externalReference);
        if (!payment) {
            throw new NotFoundError(`Payment not found for externalReference: ${gateway.externalReference}`);
        }

        payment.status = statusPayment[gateway.status];
        payment.externalReference = String(gateway.id);
        await this.paymentRepository.update(payment.id, payment);

        if (gateway.status === 'approved') {
            this.logger.info('Processing approved payment for order', { orderId: payment.orderId });
            await this.orderPaymentsApproved.execute(payment.orderId);
        } else if (gateway.status === 'rejected') {
            this.logger.info('Processing failed payment for order', { orderId: payment.orderId });
            await this.orderPaymentsFailed.execute(payment.orderId);
        } else {
            this.logger.warn('Unhandled payment status', { gatewayStatus: gateway.status });
        }
    }
}
