import { Payment } from '#/domain/entities/payment.entity';

export interface IPaymentRepository {
    create(payment: Payment): Promise<Payment>;
    findById(id: string): Promise<Payment | null>;
    update(id: string, payment: Payment): Promise<Payment>;
}
