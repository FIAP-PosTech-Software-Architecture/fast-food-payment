import { CreateQrCodeInput } from '#/domain/gateways/payment/dto/create-qr-code-input';

export interface ICreatePayment {
    execute(request: CreateQrCodeInput): Promise<string>;
}
