import { StatusPayment } from '@prisma/client';
import { vi } from 'vitest';

import { Payment } from '#/domain/entities/payment.entity';
import { IPaymentRepository } from '#/domain/repositories/payment.repository';

export class PrismaPaymentMockRepository implements IPaymentRepository {
    async create(payment: Payment): Promise<Payment> {
        return Promise.resolve(payment);
    }

    async findById(_id: string): Promise<Payment | null> {
        return Promise.resolve(null);
    }

    async update(_id: string, payment: Payment): Promise<Payment> {
        return Promise.resolve(payment);
    }
}

const paymentMock = new Payment({
    id: '1',
    orderId: 'order-123',
    status: StatusPayment.PENDING,
    externalReference: 'ext-ref-123',
    qrCode: 'qr-code-data',
});

type MockOptions = {
    data?: Payment;
    empty?: boolean;
};

export function mockPaymentCreate({ data = paymentMock }: MockOptions = {}) {
    return vi.spyOn(PrismaPaymentMockRepository.prototype, 'create').mockResolvedValueOnce(data);
}

export function mockPaymentFindById({ data = paymentMock, empty }: MockOptions = {}) {
    return vi.spyOn(PrismaPaymentMockRepository.prototype, 'findById').mockResolvedValueOnce(empty ? null : data);
}

export function mockPaymentUpdate({ data = paymentMock }: MockOptions = {}) {
    return vi.spyOn(PrismaPaymentMockRepository.prototype, 'update').mockResolvedValueOnce(data);
}
