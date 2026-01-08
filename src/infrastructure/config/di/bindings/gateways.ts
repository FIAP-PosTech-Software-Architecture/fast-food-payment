import { Container } from 'inversify';

import { IUpdateOrderStatus } from '#/domain/gateways/order/update-order-status';
import { ICreatePayment } from '#/domain/gateways/payment/create-payment';
import { IGetPayment } from '#/domain/gateways/payment/get-payment';
import { TYPES } from '#/infrastructure/config/di/types';
import { FastFoodOrderUpdateOrderStatus } from '#/infrastructure/gateways/fast-food-order/fast-food-order-update-order-status';
import { MercadoPagoCreatePayment } from '#/infrastructure/gateways/mercado-pago/mercado-pago-create-payment';
import { MercadoPagoGetPayment } from '#/infrastructure/gateways/mercado-pago/mercado-pago-get-payment';

export function bindGateways(container: Container) {
    container.bind<ICreatePayment>(TYPES.CreatePaymentGateway).to(MercadoPagoCreatePayment).inTransientScope();
    container.bind<IGetPayment>(TYPES.GetPaymentGateway).to(MercadoPagoGetPayment).inTransientScope();
    container
        .bind<IUpdateOrderStatus>(TYPES.UpdateOrderStatusGateway)
        .to(FastFoodOrderUpdateOrderStatus)
        .inTransientScope();
}
