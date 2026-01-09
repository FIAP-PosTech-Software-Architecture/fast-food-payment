import { StatusPayment } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import { Payment } from '#/domain/entities/payment.entity';
import { PaymentPresenter } from '#/interfaces/presenter/payment.presenter';

describe('PaymentPresenter', () => {
    describe('toHTTP', () => {
        it('should map payment to HTTP response with all fields', () => {
            const payment = new Payment({
                id: 'payment-123',
                orderId: 'order-456',
                status: StatusPayment.APPROVED,
                externalReference: 'ext-ref-123',
                qrCode: 'qr-code-data',
            });

            const result = PaymentPresenter.toHTTP(payment);

            expect(result).toEqual({
                id: 'payment-123',
                orderId: 'order-456',
                status: StatusPayment.APPROVED,
                externalReference: 'ext-ref-123',
                qrCode: 'qr-code-data',
            });
        });

        it('should map payment without optional fields', () => {
            const payment = new Payment({
                id: 'payment-456',
                orderId: 'order-789',
                status: StatusPayment.PENDING,
            });

            const result = PaymentPresenter.toHTTP(payment);

            expect(result).toEqual({
                id: 'payment-456',
                orderId: 'order-789',
                status: StatusPayment.PENDING,
                externalReference: null,
                qrCode: null,
            });
        });
    });
});
