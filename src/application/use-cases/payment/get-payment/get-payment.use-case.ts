import { Payment } from '#/domain/entities/payment.entity';

export interface IGetPaymentUseCase {
    execute(id: string): Promise<Payment>;
}
