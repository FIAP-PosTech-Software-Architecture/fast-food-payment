import { StatusPayment } from '@prisma/client';
import { inject, injectable } from 'inversify';

import { ICreatePaymentUseCase } from '#/application/use-cases/payment/create-payment/create-payment.use-case';
import { Payment } from '#/domain/entities/payment.entity';
import { ICreatePayment } from '#/domain/gateways/payment/create-payment';
import { IPaymentRepository } from '#/domain/repositories/payment.repository';
import { ILogger } from '#/domain/services/logger.service';
import { TYPES } from '#/infrastructure/config/di/types';
import { PaymentGatewayMapper } from '#/infrastructure/gateways/mercado-pago/mappers/payment-gateway.mapper';
import { PaymentCreateRequest } from '#/interfaces/http/schemas/payment/payment-request.schema';

@injectable()
export class CreatePayment implements ICreatePaymentUseCase {
    constructor(
        @inject(TYPES.Logger) private readonly logger: ILogger,
        @inject(TYPES.CreatePaymentGateway) private readonly paymentGateway: ICreatePayment,
        @inject(TYPES.PaymentRepository) private readonly paymentRepository: IPaymentRepository,
    ) {}

    async execute(request: PaymentCreateRequest): Promise<Payment> {
        this.logger.info('Creating payment', {
            totalAmount: request.totalAmount,
            productsCount: request.orderProducts.length,
        });

        const payment = new Payment({
            orderId: request.orderId,
            status: StatusPayment.PENDING,
        });

        this.logger.info('Requesting QR code from payment gateway', {
            paymentId: payment.id,
            totalAmount: request.totalAmount,
        });

        const gatewayRequest = PaymentGatewayMapper.toGatewayMapper(payment, request);
        const qrCodeResponse = await this.paymentGateway.execute(gatewayRequest);

        payment.setQrCode(qrCodeResponse);

        const createdPayment = await this.paymentRepository.create(payment);

        this.logger.info('Payment created successfully', {
            paymentId: createdPayment.id,
            status: createdPayment.status,
            hasQrCode: !!createdPayment.qrCode,
        });

        return createdPayment;
    }
}
