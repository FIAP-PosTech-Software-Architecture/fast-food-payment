import { z } from 'zod';

const VALIDATION_MESSAGES = {
    QUANTITY_MUST_BE_POSITIVE: 'The quantity must be greater than zero',
    MINIMUM_PRODUCTS: 'At least one item is required in the order',
    INVALID_UUID: 'Invalid UUID format',
} as const;

export const paymentCreateRequestSchema = z.object({
    orderId: z.string().uuid({ message: VALIDATION_MESSAGES.INVALID_UUID }),
    totalAmount: z.number(),
    orderProducts: z
        .array(
            z.object({
                productId: z.string().uuid({ message: VALIDATION_MESSAGES.INVALID_UUID }),
                name: z.string(),
                description: z.string().optional(),
                category: z.string(),
                unitPrice: z.number(),
                quantity: z.number().min(1, { message: VALIDATION_MESSAGES.QUANTITY_MUST_BE_POSITIVE }),
                subtotal: z.number(),
            }),
        )
        .min(1, { message: VALIDATION_MESSAGES.MINIMUM_PRODUCTS }),
});

export const paymentParamsRequestSchema = z.object({
    id: z.string().uuid({ message: VALIDATION_MESSAGES.INVALID_UUID }),
});

export const paymentWebhookRequestSchema = z.object({
    action: z.string(),
    api_version: z.string(),
    data: z.object({
        id: z.string(),
    }),
    id: z.number(),
    type: z.string(),
});

export type PaymentCreateRequest = z.infer<typeof paymentCreateRequestSchema>;
export type PaymentParamsRequest = z.infer<typeof paymentParamsRequestSchema>;
export type PaymentWebhookRequest = z.infer<typeof paymentWebhookRequestSchema>;
