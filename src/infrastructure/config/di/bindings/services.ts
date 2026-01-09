import { Container } from 'inversify';

import { IHttpClientService } from '#/domain/services/http-client.service';
import { ILogger } from '#/domain/services/logger.service';
import { TYPES } from '#/infrastructure/config/di/types';
import { createPinoLogger } from '#/infrastructure/config/logger';
import { AxiosHttpClientService } from '#/infrastructure/services/axios-http-client.service';
import { PinoLoggerService } from '#/infrastructure/services/pino-logger.service';

export function bindServices(container: Container) {
    container.bind<IHttpClientService>(TYPES.HttpClientService).to(AxiosHttpClientService).inSingletonScope();
    container
        .bind<ILogger>(TYPES.Logger)
        .toDynamicValue(() => {
            return new PinoLoggerService(createPinoLogger());
        })
        .inRequestScope();
}
