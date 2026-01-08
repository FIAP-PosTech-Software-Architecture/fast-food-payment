import { AxiosError } from 'axios';
import { inject } from 'inversify';

import { UpdateOrderStatusDto } from '#/domain/gateways/order/dto/update-order-status.dto';
import { IUpdateOrderStatus } from '#/domain/gateways/order/update-order-status';
import { IHttpClientService } from '#/domain/services/http-client.service';
import { ILogger } from '#/domain/services/logger.service';
import { TYPES } from '#/infrastructure/config/di/types';
import { env } from '#/infrastructure/config/env';

export class FastFoodOrderUpdateOrderStatus implements IUpdateOrderStatus {
    private readonly baseUrl = env.FAST_FOOD_ORDER_API_URL;

    constructor(
        @inject(TYPES.Logger) private readonly logger: ILogger,
        @inject(TYPES.HttpClientService) private readonly httpClient: IHttpClientService,
    ) {}

    async execute(request: UpdateOrderStatusDto): Promise<void> {
        try {
            this.logger.info('Updating order status in fast-food-order service', { request });

            const url = `${this.baseUrl}/order/${request.orderId}/status`;
            await this.httpClient.patch<any, any>(url, {
                status: request.status,
            });

            this.logger.info('Order status updated successfully in fast-food-order service', { request });
        } catch (error) {
            const axiosError = error as AxiosError;

            this.logger.error('Failed to update order status in fast-food-order service', error as Error, {
                request,
                status: axiosError.response?.status,
            });

            throw error;
        }
    }
}
