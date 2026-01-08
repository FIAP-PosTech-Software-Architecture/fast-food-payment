import { StatusPayment } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';

import { CreatePayment } from '#/application/use-cases/payment/create-payment/create-payment';
import { Payment } from '#/domain/entities/payment.entity';
import { ICreatePayment } from '#/domain/gateways/payment/create-payment';
import * as paymentMock from '#/infrastructure/repositories/prisma/mocks/prisma-payment-mock.repository';
import { createLoggerMock } from '#/infrastructure/services/mocks/logger-mock.service';

describe('create-payment', () => {
    const createPaymentGatewayMock = (): ICreatePayment => ({
        execute: vi.fn(),
    });

    const logger = createLoggerMock();
    const paymentGateway = createPaymentGatewayMock();
    const paymentRepository = new paymentMock.PrismaPaymentMockRepository();

    const createPaymentUseCase = new CreatePayment(logger, paymentGateway, paymentRepository);

    it('should create a payment with QR code', async () => {
        const request = {
            orderId: 'order-123',
            totalAmount: 2599,
            orderProducts: [
                {
                    productId: 'product-1',
                    name: 'Coca-Cola',
                    description: 'Refreshing beverage',
                    category: 'Beverages',
                    unitPrice: 599,
                    quantity: 2,
                    subtotal: 1198,
                },
                {
                    productId: 'product-2',
                    name: 'Burger',
                    description: 'Delicious burger',
                    category: 'Food',
                    unitPrice: 1401,
                    quantity: 1,
                    subtotal: 1401,
                },
            ],
        };

        const qrCodeResponse = 'qr-code-mock-data';
        vi.spyOn(paymentGateway, 'execute').mockResolvedValueOnce(qrCodeResponse);

        const createMock = paymentMock.mockPaymentCreate();

        const result = await createPaymentUseCase.execute(request);

        expect(result).toBeInstanceOf(Payment);
        expect(result.status).toBe(StatusPayment.PENDING);
        expect(result.qrCode).toBe(qrCodeResponse);
        expect(paymentGateway.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                external_reference: result.id,
                total_amount: 2599,
                items: expect.arrayContaining([
                    expect.objectContaining({
                        sku_number: 'product-1',
                        category: 'Beverages',
                        title: 'Coca-Cola',
                        quantity: 2,
                        unit_price: 599,
                        total_amount: 1198,
                    }),
                    expect.objectContaining({
                        sku_number: 'product-2',
                        category: 'Food',
                        title: 'Burger',
                        quantity: 1,
                        unit_price: 1401,
                        total_amount: 1401,
                    }),
                ]),
            }),
        );
        expect(createMock).toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledWith('Creating payment', {
            totalAmount: 2599,
            productsCount: 2,
        });
        expect(logger.info).toHaveBeenCalledWith('Requesting QR code from payment gateway', {
            paymentId: result.id,
            totalAmount: 2599,
        });
        expect(logger.info).toHaveBeenCalledWith('Payment created successfully', {
            paymentId: result.id,
            status: StatusPayment.PENDING,
            hasQrCode: true,
        });
    });

    it('should create a payment with single product', async () => {
        const request = {
            orderId: 'order-123',
            totalAmount: 599,
            orderProducts: [
                {
                    productId: 'product-1',
                    name: 'Coca-Cola',
                    description: 'Refreshing beverage',
                    category: 'Beverages',
                    unitPrice: 599,
                    quantity: 1,
                    subtotal: 599,
                },
            ],
        };

        const qrCodeResponse = 'qr-code-single-product';
        vi.spyOn(paymentGateway, 'execute').mockResolvedValueOnce(qrCodeResponse);
        paymentMock.mockPaymentCreate();

        const result = await createPaymentUseCase.execute(request);

        expect(result.status).toBe(StatusPayment.PENDING);
        expect(result.qrCode).toBe(qrCodeResponse);
        expect(logger.info).toHaveBeenCalledWith('Creating payment', {
            totalAmount: 599,
            productsCount: 1,
        });
    });
});
