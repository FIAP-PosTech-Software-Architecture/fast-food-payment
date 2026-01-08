import { AxiosError } from 'axios';
import { inject, injectable } from 'inversify';

import { ICreatePayment } from '#/domain/gateways/payment/create-payment';
import { CreateQrCodeInput } from '#/domain/gateways/payment/dto/create-qr-code-input';
import { IHttpClientService } from '#/domain/services/http-client.service';
import { ILogger } from '#/domain/services/logger.service';
import { TYPES } from '#/infrastructure/config/di/types';
import { env } from '#/infrastructure/config/env';

@injectable()
export class MercadoPagoCreatePayment implements ICreatePayment {
    private readonly baseUrl = env.MERCADO_PAGO_BASE_URL;

    constructor(
        @inject(TYPES.Logger) private readonly logger: ILogger,
        @inject(TYPES.HttpClientService) private readonly httpClient: IHttpClientService,
    ) {}

    async execute(request: CreateQrCodeInput): Promise<string> {
        try {
            this.logger.info('Creating payment in Mercado Pago', { request });

            const userId = env.MERCADO_PAGO_USER_ID;
            const externalPosId = env.MERCADO_PAGO_POS_ID;

            const url = `${this.baseUrl}/instore/orders/qr/seller/collectors/${userId}/pos/${externalPosId}/qrs`;
            const response = await this.httpClient.post<any, any>(url, {
                external_reference: request.external_reference,
                notification_url: env.MERCADO_PAGO_NOTIFICATION_URL,
                total_amount: request.total_amount,
                items: request.items.map(item => ({
                    sku_number: item.sku_number,
                    category: item.category,
                    title: item.title,
                    description: item.description,
                    quantity: item.quantity,
                    unit_measure: 'unit',
                    unit_price: item.unit_price,
                    total_amount: item.total_amount,
                })),
                title: 'Compra em fast-food',
                description: 'Compra em fast-food',
            });

            this.logger.info('Payment created successfully in Mercado Pago', { request });

            return response.data.qr_data as string;
        } catch (error) {
            const axiosError = error as AxiosError;

            this.logger.error('Failed to create payment in Mercado Pago', error as Error, {
                request,
                status: axiosError.response?.status,
            });

            throw error;
        }
    }
}
