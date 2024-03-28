import { z } from 'zod';

export const createdResponseValidation = z.object({
  formAnswers: z.array(
    z.object({
      elementId: z.string(),
      answers: z.array(
        z.object({
          fieldId: z.string(),
          text: z.string(),
        }),
      ),
    }),
  ),
});

export type CreatedResponseSchema = z.infer<typeof createdResponseValidation>;
