import { randomUUID } from 'crypto';

import { StatusPayment } from '@prisma/client';

type PaymentPayload = {
    id?: string;
    orderId: string;
    status: StatusPayment;
    externalReference?: string;
    qrCode?: string;
};

export class Payment {
    public readonly id: string;
    public orderId: string;
    public status: StatusPayment;
    public externalReference?: string | null;
    public qrCode?: string | null;

    constructor(payload: PaymentPayload) {
        this.id = payload.id || randomUUID();
        this.orderId = payload.orderId;
        this.status = payload.status;
        this.externalReference = payload.externalReference || null;
        this.qrCode = payload.qrCode || null;
    }

    setQrCode(qrCode: string) {
        this.qrCode = qrCode;
    }
}
