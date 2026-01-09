import { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import { TYPES } from '#/infrastructure/config/di/types';
import { PaymentController } from '#/interfaces/controller/payment.controller';
import {
    PaymentCreateRequest,
    PaymentParamsRequest,
    PaymentWebhookRequest,
} from '#/interfaces/http/schemas/payment/payment-request.schema';
import {
    paymentCreateSchema,
    paymentGetSchema,
    paymentWebhookSchema,
} from '#/interfaces/http/schemas/payment/payment.route-schema';

export const paymentRoute = (app: FastifyInstance) => {
    const controller = app.container.get<PaymentController>(TYPES.PaymentController);

    app.post<{ Body: PaymentCreateRequest }>('/', paymentCreateSchema, async (req, reply) => {
        const response = await controller.create(req.body);
        return reply.status(StatusCodes.CREATED).send(response);
    });

    app.get<{ Params: PaymentParamsRequest }>('/:id', paymentGetSchema, async (req, reply) => {
        const response = await controller.get(req.params.id);
        return reply.send(response);
    });

    app.post<{ Body: PaymentWebhookRequest }>('/webhook', paymentWebhookSchema, async (req, reply) => {
        await controller.webhook(req.body);
        return reply.status(StatusCodes.NO_CONTENT).send();
    });
};
