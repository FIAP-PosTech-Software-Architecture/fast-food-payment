import z from 'zod';

export const paymentResponseSchema = z.object({
    id: z.string().uuid(),
    orderId: z.string().uuid(),
    status: z.string(),
    externalReference: z.string().nullable(),
    qrCode: z.string().nullable(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export const paymentWebhookResponseSchema = z.object({});

export type PaymentResponse = z.infer<typeof paymentResponseSchema>;
export type PaymentWebhookResponse = z.infer<typeof paymentWebhookResponseSchema>;
