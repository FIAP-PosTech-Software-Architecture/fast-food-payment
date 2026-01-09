import awsLambdaFastify from '@fastify/aws-lambda';
import { Handler } from 'aws-lambda';
import { FastifyInstance } from 'fastify';

import { createApp } from '#/main/factories/app';

let appInstance: FastifyInstance | null = null;

async function getApp(): Promise<FastifyInstance> {
    if (!appInstance) {
        appInstance = await createApp();
    }
    return appInstance;
}

export const handler: Handler = async (event, context) => {
    try {
        const app = await getApp();
        const proxy = awsLambdaFastify(app);
        return await proxy(event, context);
    } catch (error) {
        console.error('Lambda handler error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal Server Error',
                message: error instanceof Error ? error.message : 'Unknown error',
            }),
        };
    }
};
