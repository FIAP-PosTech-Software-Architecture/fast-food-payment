export interface IOrderPaymentsFailed {
    execute(orderId: string): Promise<void>;
}
