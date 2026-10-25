import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const optionalUrl = z.string().trim().url().nullable().optional();

export const merchandiseAvailabilitySchema = z.enum([
  "AVAILABLE",
  "SOLD_OUT",
  "COMING_SOON",
]);

export const createMerchandiseSchema = z
  .object({
    name: z.string().trim().min(2).max(200),
    slug: slugSchema,
    description: z.string().trim().max(3000).nullable().optional(),
    imageUrl: optionalUrl,
    price: z.number().finite().min(0).max(99999999.99).nullable().optional(),
    orderFormUrl: optionalUrl,
    availability: merchandiseAvailabilitySchema.optional(),
    sortOrder: z.number().int().min(0).max(100000).optional(),
    isPublished: z.boolean().optional(),
  })
  .strict();

export const updateMerchandiseSchema = createMerchandiseSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided.",
  });

export const updateMerchandiseVisibilitySchema = z
  .object({
    isPublished: z.boolean(),
  })
  .strict();

export const merchandiseIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const merchandiseSlugParamSchema = z.object({
  slug: slugSchema,
});

export type CreateMerchandiseInput = z.infer<
  typeof createMerchandiseSchema
>;

export type UpdateMerchandiseInput = z.infer<
  typeof updateMerchandiseSchema
>;

export type MerchandiseAvailability = z.infer<
  typeof merchandiseAvailabilitySchema
>;