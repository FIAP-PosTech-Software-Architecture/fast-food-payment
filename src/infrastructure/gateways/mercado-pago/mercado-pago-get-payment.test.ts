import { AxiosError } from 'axios';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { IHttpClientService } from '#/domain/services/http-client.service';
import { MercadoPagoGetPayment } from '#/infrastructure/gateways/mercado-pago/mercado-pago-get-payment';
import { createLoggerMock } from '#/infrastructure/services/mocks/logger-mock.service';

vi.mock('#/infrastructure/config/env', () => ({
    env: { MERCADO_PAGO_BASE_URL: 'https://api.mercadopago.com' },
}));

describe('MercadoPagoGetPayment', () => {
    const createHttpClientMock = (): IHttpClientService => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
    });

    let loggerMock: ReturnType<typeof createLoggerMock>;
    let httpClientMock: IHttpClientService;
    let gateway: MercadoPagoGetPayment;

    beforeEach(() => {
        vi.clearAllMocks();
        loggerMock = createLoggerMock();
        httpClientMock = createHttpClientMock();
        gateway = new MercadoPagoGetPayment(loggerMock, httpClientMock);
    });

    it('should get payment successfully', async () => {
        const mockResponse = {
            data: {
                id: '123456789',
                external_reference: 'payment-123',
                status: 'approved',
            },
        };
        vi.spyOn(httpClientMock, 'get').mockResolvedValueOnce(mockResponse);

        const result = await gateway.execute('123456789');

        expect(result).toEqual({
            id: '123456789',
            externalReference: 'payment-123',
            status: 'approved',
        });
        expect(httpClientMock.get).toHaveBeenCalledWith('https://api.mercadopago.com/v1/payments/123456789');
        expect(loggerMock.info).toHaveBeenCalledWith('Payment retrieved successfully in Mercado Pago', {
            paymentId: '123456789',
        });
    });

    it('should throw error when Mercado Pago fails', async () => {
        const axiosError = { response: { status: 404 }, message: 'Not found' } as AxiosError;
        vi.spyOn(httpClientMock, 'get').mockRejectedValueOnce(axiosError);

        await expect(gateway.execute('123456789')).rejects.toEqual(axiosError);

        expect(loggerMock.error).toHaveBeenCalledWith('Failed to get payment in Mercado Pago', axiosError, {
            paymentId: '123456789',
            status: 404,
        });
    });
});
