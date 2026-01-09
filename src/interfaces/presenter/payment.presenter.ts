import { Payment } from '#/domain/entities/payment.entity';
import { PaymentResponse } from '#/interfaces/http/schemas/payment/payment-response.schema';

export class PaymentPresenter {
    static toHTTP(payment: Payment): PaymentResponse {
        return {
            id: payment.id,
            orderId: payment.orderId,
            status: payment.status,
            externalReference: payment.externalReference ?? null,
            qrCode: payment.qrCode ?? null,
        };
    }
}
