interface Item {
    sku_number: string;
    category: string;
    title: string;
    description?: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
}

export interface CreateQrCodeInput {
    external_reference: string;
    items: Item[];
    total_amount: number;
}
