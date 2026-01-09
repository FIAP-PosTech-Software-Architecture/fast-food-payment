import { Container } from 'inversify';

import { TYPES } from '#/infrastructure/config/di/types';
import { PaymentController } from '#/interfaces/controller/payment.controller';

export function bindControllers(container: Container) {
    container.bind<PaymentController>(TYPES.PaymentController).to(PaymentController).inTransientScope();
}
