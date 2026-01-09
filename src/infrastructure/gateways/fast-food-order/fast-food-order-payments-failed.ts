import { AxiosError } from 'axios';
import { inject } from 'inversify';

import { IOrderPaymentsFailed } from '#/domain/gateways/order/order-payments-failed';
import { IHttpClientService } from '#/domain/services/http-client.service';
import { ILogger } from '#/domain/services/logger.service';
import { TYPES } from '#/infrastructure/config/di/types';
import { env } from '#/infrastructure/config/env';

export class FastFoodOrderPaymentsFailed implements IOrderPaymentsFailed {
    private readonly baseUrl = env.FAST_FOOD_ORDER_API_URL;

    constructor(
        @inject(TYPES.Logger) private readonly logger: ILogger,
        @inject(TYPES.HttpClientService) private readonly httpClient: IHttpClientService,
    ) {}

    async execute(orderId: string): Promise<void> {
        try {
            this.logger.info('Updating order payments failed status in fast-food-order service', { orderId });

            const url = `${this.baseUrl}/order/${orderId}/failed`;
            await this.httpClient.post<any, any>(url, {});

            this.logger.info('Order payments failed status updated successfully in fast-food-order service', {
                orderId,
            });
        } catch (error) {
            const axiosError = error as AxiosError;

            this.logger.error(
                'Failed to update order payments failed status in fast-food-order service',
                error as Error,
                {
                    orderId,
                    status: axiosError.response?.status,
                },
            );

            throw error;
        }
    }
}
