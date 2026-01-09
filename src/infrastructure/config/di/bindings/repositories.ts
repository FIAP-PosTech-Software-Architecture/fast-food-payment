import { Container } from 'inversify';

import { IPaymentRepository } from '#/domain/repositories/payment.repository';
import { TYPES } from '#/infrastructure/config/di/types';
import { PrismaPaymentRepository } from '#/infrastructure/repositories/prisma/prisma-payment.repository';

export function bindRepositories(container: Container) {
    container.bind<IPaymentRepository>(TYPES.PaymentRepository).to(PrismaPaymentRepository).inSingletonScope();
}
