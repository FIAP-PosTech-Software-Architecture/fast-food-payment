import { vi } from 'vitest';

import { ILogger } from '#/domain/services/logger.service';

export const createLoggerMock = (): ILogger => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
});
