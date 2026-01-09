import { Payment as PrismaPayment, Prisma } from '@prisma/client';

import { Payment } from '#/domain/entities/payment.entity';

export class PrismaPaymentMapper {
    static toDomain(data: PrismaPayment): Payment {
        return new Payment({
            id: data.id,
            orderId: data.orderId,
            status: data.status,
            externalReference: data.externalReference || undefined,
            qrCode: data.qrCode || undefined,
        });
    }

    static toCreate(payment: Payment): Prisma.PaymentCreateInput {
        return {
            id: payment.id,
            orderId: payment.orderId,
            status: payment.status,
            externalReference: payment.externalReference,
            qrCode: payment.qrCode,
        };
    }

    static toUpdate(payment: Payment): Prisma.PaymentUpdateInput {
        return {
            orderId: payment.orderId,
            status: payment.status,
            externalReference: payment.externalReference,
            qrCode: payment.qrCode,
        };
    }
}
