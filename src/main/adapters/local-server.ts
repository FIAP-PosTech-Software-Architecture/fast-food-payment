/* eslint-disable @typescript-eslint/no-misused-promises */
import { FastifyInstance } from 'fastify';

import { env } from '#/infrastructure/config/env';
import { createApp } from '#/main/factories/app';

export async function startLocalServer(): Promise<void> {
    try {
        const app = await createApp();
        const port = env.PORT || 3000;

        await app.listen({ port, host: '0.0.0.0' });
        console.info(`🚀 Server running locally at http://localhost:${port}`);

        setupGracefulShutdown(app);
    } catch (error) {
        console.error('Failed to start local server', error);
        process.exit(1);
    }
}

function setupGracefulShutdown(app: FastifyInstance): void {
    const shutdown = async (signal: string) => {
        console.info(`${signal} received, closing server...`);
        await app.close();
        process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}
