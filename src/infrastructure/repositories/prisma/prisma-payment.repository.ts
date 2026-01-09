import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

import { Payment } from '#/domain/entities/payment.entity';
import { IPaymentRepository } from '#/domain/repositories/payment.repository';
import { TYPES } from '#/infrastructure/config/di/types';
import { PrismaPaymentMapper } from '#/infrastructure/repositories/prisma/mappers/prisma-payment.mapper';

@injectable()
export class PrismaPaymentRepository implements IPaymentRepository {
    constructor(@inject(TYPES.PrismaClient) private readonly prisma: PrismaClient) {}

    async create(payment: Payment): Promise<Payment> {
        const data = await this.prisma.payment.create({
            data: PrismaPaymentMapper.toCreate(payment),
        });

        return PrismaPaymentMapper.toDomain(data);
    }

    async findById(id: string): Promise<Payment | null> {
        const data = await this.prisma.payment.findUnique({
            where: { id },
        });
        if (!data) return null;
        return PrismaPaymentMapper.toDomain(data);
    }

    async update(id: string, payment: Payment): Promise<Payment> {
        const data = await this.prisma.payment.update({
            where: { id },
            data: PrismaPaymentMapper.toUpdate(payment),
        });
        return PrismaPaymentMapper.toDomain(data);
    }
}
