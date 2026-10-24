import { z } from "zod";

const categoryFields = {
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers, and single hyphens.",
    ),
  description: z.string().trim().max(1000).nullable().optional(),
};

const categoryObjectSchema = z.object(categoryFields).strict();

export const createCategorySchema = categoryObjectSchema;

export const updateCategorySchema = categoryObjectSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export const categoryIdParamSchema = z.object({
  id: z.string().min(1),
});

export const updateCategoryStatusSchema = z
  .object({
    isActive: z.boolean(),
  })
  .strict();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type UpdateCategoryStatusInput = z.infer<
  typeof updateCategoryStatusSchema
>;