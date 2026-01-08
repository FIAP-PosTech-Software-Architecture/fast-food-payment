import { Container } from 'inversify';

declare module 'fastify' {
    interface FastifyInstance {
        container: Container;
    }

    interface FastifyRequest {
        user?: {
            cpf: string;
        };
    }
}
