import { StatusPayment } from '@prisma/client';
import { inject, injectable } from 'inversify';

import { IWebhookPaymentUseCase } from '#/application/use-cases/payment/webhook-payment/webhook-payment.use-case';
import { OrderStatus } from '#/domain/enum/order-status.enum';
import { NotFoundError } from '#/domain/errors';
import { IUpdateOrderStatus } from '#/domain/gateways/order/update-order-status';
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

const orderStatus: Record<string, OrderStatus> = {
    pending: OrderStatus.WAITING,
    approved: OrderStatus.RECEIVED,
    rejected: OrderStatus.CANCELED,
};

@injectable()
export class WebhookPaymentUseCase implements IWebhookPaymentUseCase {
    constructor(
        @inject(TYPES.Logger) private readonly logger: ILogger,
        @inject(TYPES.GetPaymentGateway) private readonly getPaymentGateway: IGetPayment,
        @inject(TYPES.PaymentRepository) private readonly paymentRepository: IPaymentRepository,
        @inject(TYPES.UpdateOrderStatusGateway) private readonly updateOrderStatusGateway: IUpdateOrderStatus,
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

        await this.updateOrderStatusGateway.execute({
            orderId: payment.orderId,
            status: orderStatus[gateway.status],
        });
    }
}
