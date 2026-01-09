import { StatusPayment } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import { Payment } from '#/domain/entities/payment.entity';
import { PaymentGatewayMapper } from '#/infrastructure/gateways/mercado-pago/mappers/payment-gateway.mapper';
import { PaymentCreateRequest } from '#/interfaces/http/schemas/payment/payment-request.schema';

describe('PaymentGatewayMapper', () => {
    describe('toGatewayMapper', () => {
        it('should map payment and request to CreateQrCodeInput', () => {
            const payment = new Payment({
                id: 'payment-123',
                orderId: 'order-456',
                status: StatusPayment.PENDING,
            });

            const request: PaymentCreateRequest = {
                orderId: 'order-456',
                totalAmount: 3198,
                orderProducts: [
                    {
                        productId: 'product-1',
                        name: 'Hamburger',
                        description: 'Delicious burger',
                        category: 'Food',
                        unitPrice: 1599,
                        quantity: 2,
                        subtotal: 3198,
                    },
                ],
            };

            const result = PaymentGatewayMapper.toGatewayMapper(payment, request);

            expect(result).toEqual({
                external_reference: 'payment-123',
                total_amount: 3198,
                items: [
                    {
                        sku_number: 'product-1',
                        category: 'Food',
                        title: 'Hamburger',
                        description: 'Delicious burger',
                        quantity: 2,
                        unit_measure: 'unit',
                        unit_price: 1599,
                        total_amount: 3198,
                    },
                ],
                title: 'Compra em fast-food',
                description: 'Compra em fast-food',
            });
        });

        it('should map payment without product description', () => {
            const payment = new Payment({
                id: 'payment-456',
                orderId: 'order-789',
                status: StatusPayment.PENDING,
            });

            const request: PaymentCreateRequest = {
                orderId: 'order-789',
                totalAmount: 599,
                orderProducts: [
                    {
                        productId: 'product-2',
                        name: 'French Fries',
                        category: 'Sides',
                        unitPrice: 599,
                        quantity: 1,
                        subtotal: 599,
                    },
                ],
            };

            const result = PaymentGatewayMapper.toGatewayMapper(payment, request);

            expect(result.items[0].description).toBeUndefined();
        });
    });
});
