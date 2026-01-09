import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import { env } from '#/infrastructure/config/env';

interface ValidationDetail {
    field: string;
    message?: string;
}

interface ErrorResponse {
    error: string;
    message: string;
    details?: ValidationDetail[];
}

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
    request.log.error(
        {
            err: error,
            requestId: request.id,
            url: request.url,
            method: request.method,
        },
        'Request error',
    );

    const statusCode = (error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR) as StatusCodes;

    if (error.validation) {
        const details: ValidationDetail[] = error.validation.map(err => ({
            field: err.instancePath.replace('/', ''),
            message: err.message,
        }));

        const response: ErrorResponse = {
            error: 'Bad Request',
            message: 'Validation failed',
            details,
        };

        reply.status(StatusCodes.BAD_REQUEST).send(response);
        return;
    }

    if (statusCode === StatusCodes.UNAUTHORIZED) {
        return reply.status(StatusCodes.UNAUTHORIZED).send({
            error: 'Unauthorized',
            message: error.message || 'Authentication required',
        });
    }

    if (statusCode === StatusCodes.FORBIDDEN) {
        return reply.status(StatusCodes.FORBIDDEN).send({
            error: 'Forbidden',
            // eslint-disable-next-line quotes
            message: error.message || "You don't have permission to access this resource",
        });
    }

    if (statusCode === StatusCodes.NOT_FOUND) {
        return reply.status(StatusCodes.NOT_FOUND).send({
            error: 'Not Found',
            message: error.message || 'Resource not found',
        });
    }

    if (statusCode === StatusCodes.CONFLICT) {
        return reply.status(StatusCodes.CONFLICT).send({
            error: 'Conflict',
            message: error.message || 'Resource already exists',
        });
    }

    const isDevelopment = env.NODE_ENV === 'dev';
    const response: ErrorResponse = {
        error: 'Internal Server Error',
        message: isDevelopment ? error.message : 'An unexpected error occurred',
    };

    reply.status(statusCode).send(response);
}
