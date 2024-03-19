import { z } from 'zod';

export const createdResponseValidation = z.object({
  formAnswers: z.array(
    z.object({
      elementId: z.number(),
      answers: z.array(
        z.object({
          fieldId: z.number(),
          text: z.string(),
        }),
      ),
    }),
  ),
});

export type CreatedResponseSchema = z.infer<typeof createdResponseValidation>;
