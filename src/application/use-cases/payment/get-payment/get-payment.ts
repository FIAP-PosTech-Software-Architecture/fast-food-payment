import { inject, injectable } from 'inversify';

import { IGetPaymentUseCase } from '#/application/use-cases/payment/get-payment/get-payment.use-case';
import { Payment } from '#/domain/entities/payment.entity';
import { NotFoundError } from '#/domain/errors';
import { IPaymentRepository } from '#/domain/repositories/payment.repository';
import { ILogger } from '#/domain/services/logger.service';
import { TYPES } from '#/infrastructure/config/di/types';

@injectable()
export class GetPayment implements IGetPaymentUseCase {
    constructor(
        @inject(TYPES.Logger) private readonly logger: ILogger,
        @inject(TYPES.PaymentRepository) private readonly paymentRepository: IPaymentRepository,
    ) {}

    async execute(id: string): Promise<Payment> {
        this.logger.info('Getting payment', { paymentId: id });

        const payment = await this.paymentRepository.findById(id);

        if (!payment) {
            this.logger.warn('Payment not found', { paymentId: id });
            throw new NotFoundError('Payment not found');
        }

        this.logger.info('Payment retrieved', {
            paymentId: payment.id,
            status: payment.status,
        });

        return payment;
    }
}
