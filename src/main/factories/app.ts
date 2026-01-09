import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastify, { FastifyInstance } from 'fastify';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { container } from '#/infrastructure/config/di/container';
import { errorHandler } from '#/interfaces/http/middlewares/error-handler';
import { paymentRoute } from '#/interfaces/http/routes/payment.route';

export async function createApp(): Promise<FastifyInstance> {
    const app = fastify({ logger: true });

    app.decorate('container', container);

    app.setSerializerCompiler(serializerCompiler);
    app.setValidatorCompiler(validatorCompiler);

    app.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'API FastFood Payment',
                description: 'Documentação da API FastFood Payment',
                version: '1.0.0',
            },
            tags: [
                {
                    name: 'Pagamentos',
                    description: 'Operações relacionadas a pagamentos',
                },
            ],
        },
        transform: jsonSchemaTransform,
    });

    app.register(fastifySwaggerUi, {
        routePrefix: '/docs',
    });

    app.register(paymentRoute, { prefix: '/payment' });

    app.setErrorHandler(errorHandler);

    return app;
}
