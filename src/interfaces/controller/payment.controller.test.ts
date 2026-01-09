import { StatusPayment } from '@prisma/client';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ICreatePaymentUseCase } from '#/application/use-cases/payment/create-payment/create-payment.use-case';
import { IGetPaymentUseCase } from '#/application/use-cases/payment/get-payment/get-payment.use-case';
import { IWebhookPaymentUseCase } from '#/application/use-cases/payment/webhook-payment/webhook-payment.use-case';
import { Payment } from '#/domain/entities/payment.entity';
import { createLoggerMock } from '#/infrastructure/services/mocks/logger-mock.service';
import { PaymentController } from '#/interfaces/controller/payment.controller';

describe('PaymentController', () => {
    const createPaymentUseCaseMock = (): ICreatePaymentUseCase => ({ execute: vi.fn() });
    const getPaymentUseCaseMock = (): IGetPaymentUseCase => ({ execute: vi.fn() });
    const webhookPaymentUseCaseMock = (): IWebhookPaymentUseCase => ({ execute: vi.fn() });

    const loggerMock = createLoggerMock();
    const createPaymentUseCase = createPaymentUseCaseMock();
    const getPaymentUseCase = getPaymentUseCaseMock();
    const webhookPaymentUseCase = webhookPaymentUseCaseMock();

    const controller = new PaymentController(
        loggerMock,
        createPaymentUseCase,
        getPaymentUseCase,
        webhookPaymentUseCase,
    );

    const paymentMock = new Payment({
        id: 'payment-123',
        orderId: 'order-456',
        status: StatusPayment.PENDING,
        externalReference: 'ext-ref-123',
        qrCode: 'qr-code-data',
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('create', () => {
        it('should create a payment', async () => {
            vi.spyOn(createPaymentUseCase, 'execute').mockResolvedValueOnce(paymentMock);

            const request = {
                orderId: 'order-456',
                totalAmount: 1599,
                orderProducts: [
                    {
                        productId: 'product-1',
                        name: 'Hamburger',
                        category: 'Food',
                        unitPrice: 1599,
                        quantity: 1,
                        subtotal: 1599,
                    },
                ],
            };

            const result = await controller.create(request);

            expect(createPaymentUseCase.execute).toHaveBeenCalledWith(request);
            expect(result.id).toBe('payment-123');
            expect(loggerMock.info).toHaveBeenCalledWith('Creating a new payment', { request });
        });
    });

    describe('get', () => {
        it('should get a payment by id', async () => {
            vi.spyOn(getPaymentUseCase, 'execute').mockResolvedValueOnce(paymentMock);

            const result = await controller.get('payment-123');

            expect(getPaymentUseCase.execute).toHaveBeenCalledWith('payment-123');
            expect(result.id).toBe('payment-123');
            expect(loggerMock.info).toHaveBeenCalledWith('Retrieving payment with ID', { id: 'payment-123' });
        });
    });

    describe('webhook', () => {
        it('should process webhook payload', async () => {
            vi.spyOn(webhookPaymentUseCase, 'execute').mockResolvedValueOnce();

            const payload = {
                action: 'payment.created',
                api_version: 'v1',
                data: { id: '123456789' },
                id: 12345,
                type: 'payment',
            };

            await controller.webhook(payload);

            expect(webhookPaymentUseCase.execute).toHaveBeenCalledWith(payload);
            expect(loggerMock.info).toHaveBeenCalledWith('Webhook received payload', { payload });
        });
    });
});
