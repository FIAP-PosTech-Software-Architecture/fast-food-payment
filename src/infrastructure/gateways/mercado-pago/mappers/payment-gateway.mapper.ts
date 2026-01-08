import { Payment } from '#/domain/entities/payment.entity';
import { PaymentCreateRequest } from '#/interfaces/http/schemas/payment/payment-request.schema';

export class PaymentGatewayMapper {
    static toGatewayMapper(payment: Payment, request: PaymentCreateRequest) {
        return {
            external_reference: payment.id,
            items: request.orderProducts.map(item => ({
                sku_number: item.productId,
                category: item.category,
                title: item.name,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                total_amount: item.subtotal,
            })),
            total_amount: request.totalAmount,
        };
    }
}
