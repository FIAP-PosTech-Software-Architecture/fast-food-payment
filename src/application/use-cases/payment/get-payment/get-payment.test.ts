import { describe, expect, it } from 'vitest';

import { GetPayment } from '#/application/use-cases/payment/get-payment/get-payment';
import { NotFoundError } from '#/domain/errors';
import * as paymentMock from '#/infrastructure/repositories/prisma/mocks/prisma-payment-mock.repository';
import { createLoggerMock } from '#/infrastructure/services/mocks/logger-mock.service';

describe('get-payment', () => {
    const logger = createLoggerMock();
    const paymentRepository = new paymentMock.PrismaPaymentMockRepository();
    const getPaymentUseCase = new GetPayment(logger, paymentRepository);

    it('should get a payment by id', async () => {
        const findByIdMock = paymentMock.mockPaymentFindById({ empty: false });

        const result = await getPaymentUseCase.execute('1');

        expect(result).toMatchObject({
            id: '1',
            status: 'PENDING',
            externalReference: 'ext-ref-123',
            qrCode: 'qr-code-data',
        });
        expect(findByIdMock).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundError if payment does not exist', async () => {
        paymentMock.mockPaymentFindById({ empty: true });

        await expect(getPaymentUseCase.execute('999')).rejects.toThrow(NotFoundError);
    });
});
