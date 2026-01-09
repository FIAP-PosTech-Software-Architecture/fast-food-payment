import { AxiosError } from 'axios';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { CreateQrCodeInput } from '#/domain/gateways/payment/dto/create-qr-code-input';
import { IHttpClientService } from '#/domain/services/http-client.service';
import { MercadoPagoCreatePayment } from '#/infrastructure/gateways/mercado-pago/mercado-pago-create-payment';
import { createLoggerMock } from '#/infrastructure/services/mocks/logger-mock.service';

vi.mock('#/infrastructure/config/env', () => ({
    env: {
        MERCADO_PAGO_BASE_URL: 'https://api.mercadopago.com',
        MERCADO_PAGO_USER_ID: 'user-123',
        MERCADO_PAGO_POS_ID: 'pos-456',
        MERCADO_PAGO_TOKEN: 'test-token',
        MERCADO_PAGO_NOTIFICATION_URL: 'https://webhook.test/notify',
    },
}));

describe('MercadoPagoCreatePayment', () => {
    const createHttpClientMock = (): IHttpClientService => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
    });

    let loggerMock: ReturnType<typeof createLoggerMock>;
    let httpClientMock: IHttpClientService;
    let gateway: MercadoPagoCreatePayment;

    beforeEach(() => {
        vi.clearAllMocks();
        loggerMock = createLoggerMock();
        httpClientMock = createHttpClientMock();
        gateway = new MercadoPagoCreatePayment(loggerMock, httpClientMock);
    });

    const mockRequest: CreateQrCodeInput = {
        external_reference: 'payment-123',
        total_amount: 1599,
        items: [
            {
                sku_number: 'product-1',
                category: 'Food',
                title: 'Hamburger',
                description: 'Delicious burger',
                quantity: 1,
                unit_measure: 'unit',
                unit_price: 1599,
                total_amount: 1599,
            },
        ],
        title: 'Compra em fast-food',
        description: 'Compra em fast-food',
    };

    it('should create payment successfully', async () => {
        vi.spyOn(httpClientMock, 'post').mockResolvedValueOnce({ qr_data: 'qr-code-data-123' });

        const result = await gateway.execute(mockRequest);

        expect(result).toBe('qr-code-data-123');
        expect(httpClientMock.post).toHaveBeenCalledWith(
            'https://api.mercadopago.com/instore/orders/qr/seller/collectors/user-123/pos/pos-456/qrs',
            { ...mockRequest, notification_url: 'https://webhook.test/notify' },
            { headers: { Authorization: 'Bearer test-token', 'Content-Type': 'application/json' } },
        );
        expect(loggerMock.info).toHaveBeenCalledWith('Payment created successfully in Mercado Pago', {
            request: mockRequest,
        });
    });

    it('should throw error when Mercado Pago fails', async () => {
        const axiosError = { response: { status: 400 }, message: 'Bad request' } as AxiosError;
        vi.spyOn(httpClientMock, 'post').mockRejectedValueOnce(axiosError);

        await expect(gateway.execute(mockRequest)).rejects.toEqual(axiosError);

        expect(loggerMock.error).toHaveBeenCalledWith('Failed to create payment in Mercado Pago', axiosError, {
            request: mockRequest,
            status: 400,
        });
    });
});
