export interface IOrderPaymentsApproved {
    execute(orderId: string): Promise<void>;
}
