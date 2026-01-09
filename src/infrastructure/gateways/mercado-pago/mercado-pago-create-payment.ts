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
            const response = await this.httpClient.post<any, any>(
                url,
                {
                    ...request,
                    notification_url: env.MERCADO_PAGO_NOTIFICATION_URL,
                },
                {
                    headers: {
                        Authorization: `Bearer ${env.MERCADO_PAGO_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            console.log('AQUI', response);

            this.logger.info('Payment created successfully in Mercado Pago', { request });

            return response.qr_data as string;
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
