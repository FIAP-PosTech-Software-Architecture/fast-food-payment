import { AxiosError } from 'axios';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { IHttpClientService } from '#/domain/services/http-client.service';
import { FastFoodOrderPaymentsApproved } from '#/infrastructure/gateways/fast-food-order/fast-food-order-payments-approved';
import { createLoggerMock } from '#/infrastructure/services/mocks/logger-mock.service';

vi.mock('#/infrastructure/config/env', () => ({
    env: { FAST_FOOD_ORDER_API_URL: 'http://localhost:3000' },
}));

describe('FastFoodOrderPaymentsApproved', () => {
    const createHttpClientMock = (): IHttpClientService => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
    });

    let loggerMock: ReturnType<typeof createLoggerMock>;
    let httpClientMock: IHttpClientService;
    let gateway: FastFoodOrderPaymentsApproved;

    beforeEach(() => {
        vi.clearAllMocks();
        loggerMock = createLoggerMock();
        httpClientMock = createHttpClientMock();
        gateway = new FastFoodOrderPaymentsApproved(loggerMock, httpClientMock);
    });

    it('should update order payments approved status successfully', async () => {
        vi.spyOn(httpClientMock, 'post').mockResolvedValueOnce(undefined);

        await gateway.execute('order-123');

        expect(httpClientMock.post).toHaveBeenCalledWith('http://localhost:3000/order/order-123/approved', {});
        expect(loggerMock.info).toHaveBeenCalledWith(
            'Order payments approved status updated successfully in fast-food-order service',
            { orderId: 'order-123' },
        );
    });

    it('should throw error when external service fails', async () => {
        const axiosError = { response: { status: 500 }, message: 'Server error' } as AxiosError;
        vi.spyOn(httpClientMock, 'post').mockRejectedValueOnce(axiosError);

        await expect(gateway.execute('order-123')).rejects.toEqual(axiosError);

        expect(loggerMock.error).toHaveBeenCalledWith(
            'Failed to update order payments approved status in fast-food-order service',
            axiosError,
            { orderId: 'order-123', status: 500 },
        );
    });
});
