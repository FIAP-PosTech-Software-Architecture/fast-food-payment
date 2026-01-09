import { Container } from 'inversify';

import { IOrderPaymentsApproved } from '#/domain/gateways/order/order-payments-approved';
import { IOrderPaymentsFailed } from '#/domain/gateways/order/order-payments-failed';
import { ICreatePayment } from '#/domain/gateways/payment/create-payment';
import { IGetPayment } from '#/domain/gateways/payment/get-payment';
import { TYPES } from '#/infrastructure/config/di/types';
import { FastFoodOrderPaymentsApproved } from '#/infrastructure/gateways/fast-food-order/fast-food-order-payments-approved';
import { FastFoodOrderPaymentsFailed } from '#/infrastructure/gateways/fast-food-order/fast-food-order-payments-failed';
import { MercadoPagoCreatePayment } from '#/infrastructure/gateways/mercado-pago/mercado-pago-create-payment';
import { MercadoPagoGetPayment } from '#/infrastructure/gateways/mercado-pago/mercado-pago-get-payment';

export function bindGateways(container: Container) {
    container.bind<ICreatePayment>(TYPES.CreatePaymentGateway).to(MercadoPagoCreatePayment).inTransientScope();
    container.bind<IGetPayment>(TYPES.GetPaymentGateway).to(MercadoPagoGetPayment).inTransientScope();
    container
        .bind<IOrderPaymentsApproved>(TYPES.OrderPaymentsApprovedGateway)
        .to(FastFoodOrderPaymentsApproved)
        .inTransientScope();
    container
        .bind<IOrderPaymentsFailed>(TYPES.OrderPaymentsFailedGateway)
        .to(FastFoodOrderPaymentsFailed)
        .inTransientScope();
}
