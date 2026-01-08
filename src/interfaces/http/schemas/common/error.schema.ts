import z from 'zod';

const baseErrorSchema = z.object({
    error: z.string().describe('Tipo de erro HTTP'),
    message: z.string().describe('Mensagem geral do erro'),
});

const validationDetailsSchema = z.object({
    details: z
        .array(
            z.object({
                field: z.string().describe('Campo que apresentou erro'),
                message: z.string().describe('Mensagem de erro para o campo'),
            }),
        )
        .optional()
        .describe('Lista de detalhes dos erros de validação'),
});

export const badRequestSchema = baseErrorSchema
    .extend({
        error: z.literal('Bad Request'),
    })
    .merge(validationDetailsSchema);

export const notFoundSchema = baseErrorSchema.extend({
    error: z.literal('Not Found'),
});

export const internalServerErrorSchema = baseErrorSchema.extend({
    error: z.literal('Internal Server Error'),
});

export type BadRequestError = z.infer<typeof badRequestSchema>;
export type NotFoundError = z.infer<typeof notFoundSchema>;
export type InternalServerError = z.infer<typeof internalServerErrorSchema>;
