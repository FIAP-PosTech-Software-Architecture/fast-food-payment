import { GetPaymentOutput } from '#/domain/gateways/payment/dto/get-payment-output';

export interface IGetPayment {
    execute(paymentId: string): Promise<GetPaymentOutput>;
}
