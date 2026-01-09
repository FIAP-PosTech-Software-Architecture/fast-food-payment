interface Item {
    sku_number: string;
    category: string;
    title: string;
    description?: string;
    quantity: number;
    unit_measure: string;
    unit_price: number;
    total_amount: number;
}

export interface CreateQrCodeInput {
    external_reference: string;
    total_amount: number;
    items: Item[];
    title: string;
    description: string;
}
