import { UpdateOrderStatusDto } from '#/domain/gateways/order/dto/update-order-status.dto';

export interface IUpdateOrderStatus {
    execute(request: UpdateOrderStatusDto): Promise<void>;
}
