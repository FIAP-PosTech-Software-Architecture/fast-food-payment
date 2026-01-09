import { Payment } from '#/domain/entities/payment.entity';
import { PaymentCreateRequest } from '#/interfaces/http/schemas/payment/payment-request.schema';

export interface ICreatePaymentUseCase {
    execute(request: PaymentCreateRequest): Promise<Payment>;
}
