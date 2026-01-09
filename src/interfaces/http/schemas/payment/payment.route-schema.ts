import { badRequestSchema, notFoundSchema } from '#/interfaces/http/schemas/common/error.schema';
import {
    paymentCreateRequestSchema,
    paymentParamsRequestSchema,
    paymentWebhookRequestSchema,
} from '#/interfaces/http/schemas/payment/payment-request.schema';
import {
    paymentResponseSchema,
    paymentWebhookResponseSchema,
} from '#/interfaces/http/schemas/payment/payment-response.schema';

export const paymentCreateSchema = {
    schema: {
        tags: ['Pagamentos'],
        summary: 'Cria pagamento',
        body: paymentCreateRequestSchema,
        response: {
            201: paymentResponseSchema,
            400: badRequestSchema,
        },
    },
};

export const paymentGetSchema = {
    schema: {
        tags: ['Pagamentos'],
        summary: 'Busca pagamento',
        params: paymentParamsRequestSchema,
        response: {
            200: paymentResponseSchema,
            404: notFoundSchema,
        },
    },
};

export const paymentWebhookSchema = {
    schema: {
        tags: ['Pagamentos'],
        summary: 'Webhook para o Mercado Pago',
        body: paymentWebhookRequestSchema,
        response: {
            200: paymentWebhookResponseSchema,
        },
    },
};
