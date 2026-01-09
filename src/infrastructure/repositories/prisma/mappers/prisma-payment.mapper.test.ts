import { StatusPayment } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import { Payment } from '#/domain/entities/payment.entity';
import { PrismaPaymentMapper } from '#/infrastructure/repositories/prisma/mappers/prisma-payment.mapper';

describe('PrismaPaymentMapper', () => {
    const mockPrismaPayment = {
        id: 'payment-123',
        orderId: 'order-456',
        status: StatusPayment.APPROVED,
        externalReference: 'ext-ref-123',
        qrCode: 'qr-code-data',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    describe('toDomain', () => {
        it('should map prisma payment to domain Payment entity', () => {
            const payment = PrismaPaymentMapper.toDomain(mockPrismaPayment);

            expect(payment).toBeInstanceOf(Payment);
            expect(payment.id).toBe('payment-123');
            expect(payment.orderId).toBe('order-456');
            expect(payment.status).toBe(StatusPayment.APPROVED);
            expect(payment.externalReference).toBe('ext-ref-123');
            expect(payment.qrCode).toBe('qr-code-data');
        });

        it('should handle null optional fields', () => {
            const prismaPaymentWithNulls = {
                ...mockPrismaPayment,
                externalReference: null,
                qrCode: null,
            };

            const payment = PrismaPaymentMapper.toDomain(prismaPaymentWithNulls);

            expect(payment.externalReference).toBeNull();
            expect(payment.qrCode).toBeNull();
        });
    });

    describe('toCreate', () => {
        it('should map domain Payment to Prisma create input', () => {
            const payment = new Payment({
                id: 'payment-789',
                orderId: 'order-101',
                status: StatusPayment.PENDING,
                externalReference: 'ext-ref-456',
                qrCode: 'qr-code-new',
            });

            const createInput = PrismaPaymentMapper.toCreate(payment);

            expect(createInput).toEqual({
                id: 'payment-789',
                orderId: 'order-101',
                status: StatusPayment.PENDING,
                externalReference: 'ext-ref-456',
                qrCode: 'qr-code-new',
            });
        });
    });

    describe('toUpdate', () => {
        it('should map domain Payment to Prisma update input', () => {
            const payment = new Payment({
                id: 'payment-789',
                orderId: 'order-101',
                status: StatusPayment.APPROVED,
                externalReference: 'ext-ref-updated',
                qrCode: 'qr-code-updated',
            });

            const updateInput = PrismaPaymentMapper.toUpdate(payment);

            expect(updateInput).toEqual({
                orderId: 'order-101',
                status: StatusPayment.APPROVED,
                externalReference: 'ext-ref-updated',
                qrCode: 'qr-code-updated',
            });
        });
    });
});
