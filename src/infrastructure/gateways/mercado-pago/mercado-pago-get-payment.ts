import { AxiosError } from 'axios';
import { inject, injectable } from 'inversify';

import { GetPaymentOutput } from '#/domain/gateways/payment/dto/get-payment-output';
import { IGetPayment } from '#/domain/gateways/payment/get-payment';
import { IHttpClientService } from '#/domain/services/http-client.service';
import { ILogger } from '#/domain/services/logger.service';
import { TYPES } from '#/infrastructure/config/di/types';
import { env } from '#/infrastructure/config/env';

@injectable()
export class MercadoPagoGetPayment implements IGetPayment {
    private readonly baseUrl = env.MERCADO_PAGO_BASE_URL;

    constructor(
        @inject(TYPES.Logger) private readonly logger: ILogger,
        @inject(TYPES.HttpClientService) private readonly httpClient: IHttpClientService,
    ) {}

    async execute(paymentId: string): Promise<GetPaymentOutput> {
        try {
            this.logger.info('Getting payment in Mercado Pago', { paymentId });

            const url = `${this.baseUrl}/v1/payments/${paymentId}`;
            const response = await this.httpClient.get<any>(url);

            this.logger.info('Payment retrieved successfully in Mercado Pago', { paymentId });

            return {
                externalReference: response.data.external_reference,
                status: response.data.status,
                id: response.data.id,
            };
        } catch (error) {
            const axiosError = error as AxiosError;

            this.logger.error('Failed to get payment in Mercado Pago', error as Error, {
                paymentId,
                status: axiosError.response?.status,
            });

            throw error;
        }
    }
}
