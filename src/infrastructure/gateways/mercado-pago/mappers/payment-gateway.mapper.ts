import { Payment } from '#/domain/entities/payment.entity';
import { CreateQrCodeInput } from '#/domain/gateways/payment/dto/create-qr-code-input';
import { PaymentCreateRequest } from '#/interfaces/http/schemas/payment/payment-request.schema';

export class PaymentGatewayMapper {
    static toGatewayMapper(payment: Payment, request: PaymentCreateRequest): CreateQrCodeInput {
        return {
            external_reference: payment.id,
            total_amount: request.totalAmount,
            items: request.orderProducts.map(item => ({
                sku_number: item.productId,
                category: item.category,
                title: item.name,
                description: item.description,
                quantity: item.quantity,
                unit_measure: 'unit',
                unit_price: item.unitPrice,
                total_amount: item.subtotal,
            })),
            title: 'Pedido em Fast-Food',
            description: `${request.orderProducts.length} itens - Total: R$ ${request.totalAmount.toFixed(2)}`,
        };
    }
}
