import { StatusPayment } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';

import { WebhookPaymentUseCase } from '#/application/use-cases/payment/webhook-payment/webhook-payment';
import { Payment } from '#/domain/entities/payment.entity';
import { OrderStatus } from '#/domain/enum/order-status.enum';
import { NotFoundError } from '#/domain/errors';
import { IUpdateOrderStatus } from '#/domain/gateways/order/update-order-status';
import { GetPaymentOutput } from '#/domain/gateways/payment/dto/get-payment-output';
import { IGetPayment } from '#/domain/gateways/payment/get-payment';
import * as paymentMock from '#/infrastructure/repositories/prisma/mocks/prisma-payment-mock.repository';
import { createLoggerMock } from '#/infrastructure/services/mocks/logger-mock.service';

describe('webhook-payment', () => {
    const createGetPaymentGatewayMock = (): IGetPayment => ({
        execute: vi.fn(),
    });

    const createUpdateOrderStatusGatewayMock = (): IUpdateOrderStatus => ({
        execute: vi.fn(),
    });

    const logger = createLoggerMock();
    const getPaymentGateway = createGetPaymentGatewayMock();
    const paymentRepository = new paymentMock.PrismaPaymentMockRepository();
    const updateOrderStatusGateway = createUpdateOrderStatusGatewayMock();

    const webhookPaymentUseCase = new WebhookPaymentUseCase(
        logger,
        getPaymentGateway,
        paymentRepository,
        updateOrderStatusGateway,
    );

    it('should process webhook for approved payment', async () => {
        const webhookRequest = {
            action: 'payment.updated',
            api_version: 'v1',
            data: {
                id: '12345',
            },
            id: 1,
            type: 'payment',
        };

        const gatewayResponse: GetPaymentOutput = {
            externalReference: 'payment-1',
            status: 'approved',
            id: 12345,
        };

        const existingPayment = new Payment({
            id: 'payment-1',
            orderId: 'order-123',
            status: StatusPayment.PENDING,
            externalReference: undefined,
            qrCode: 'qr-code-data',
        });

        vi.spyOn(getPaymentGateway, 'execute').mockResolvedValueOnce(gatewayResponse);
        paymentMock.mockPaymentFindById({ data: existingPayment });
        const updateMock = paymentMock.mockPaymentUpdate();
        vi.spyOn(updateOrderStatusGateway, 'execute').mockResolvedValueOnce();

        await webhookPaymentUseCase.execute(webhookRequest);

        expect(getPaymentGateway.execute).toHaveBeenCalledWith('12345');
        expect(updateMock).toHaveBeenCalledWith(
            'payment-1',
            expect.objectContaining({
                status: StatusPayment.APPROVED,
                externalReference: '12345',
            }),
        );
        expect(updateOrderStatusGateway.execute).toHaveBeenCalledWith({
            orderId: 'order-123',
            status: OrderStatus.RECEIVED,
        });
        expect(logger.info).toHaveBeenCalledWith('Webhook received:', gatewayResponse);
    });

    it('should process webhook for rejected payment', async () => {
        const webhookRequest = {
            action: 'payment.updated',
            api_version: 'v1',
            data: {
                id: '67890',
            },
            id: 2,
            type: 'payment',
        };

        const gatewayResponse: GetPaymentOutput = {
            externalReference: 'payment-2',
            status: 'rejected',
            id: 67890,
        };

        const existingPayment = new Payment({
            id: 'payment-2',
            orderId: 'order-456',
            status: StatusPayment.PENDING,
            externalReference: undefined,
            qrCode: 'qr-code-data',
        });

        vi.spyOn(getPaymentGateway, 'execute').mockResolvedValueOnce(gatewayResponse);
        paymentMock.mockPaymentFindById({ data: existingPayment });
        paymentMock.mockPaymentUpdate();
        vi.spyOn(updateOrderStatusGateway, 'execute').mockResolvedValueOnce();

        await webhookPaymentUseCase.execute(webhookRequest);

        expect(updateOrderStatusGateway.execute).toHaveBeenCalledWith({
            orderId: 'order-456',
            status: OrderStatus.CANCELED,
        });
    });

    it('should throw NotFoundError if payment does not exist', async () => {
        const webhookRequest = {
            action: 'payment.updated',
            api_version: 'v1',
            data: {
                id: '99999',
            },
            id: 3,
            type: 'payment',
        };

        const gatewayResponse: GetPaymentOutput = {
            externalReference: 'payment-999',
            status: 'approved',
            id: 99999,
        };

        vi.spyOn(getPaymentGateway, 'execute').mockResolvedValueOnce(gatewayResponse);
        paymentMock.mockPaymentFindById({ empty: true });

        await expect(webhookPaymentUseCase.execute(webhookRequest)).rejects.toThrow(NotFoundError);
        await expect(webhookPaymentUseCase.execute(webhookRequest)).rejects.toThrow(
            'Payment not found for externalReference: payment-999',
        );
    });
});
