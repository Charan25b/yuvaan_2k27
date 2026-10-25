import { z } from "zod";

const imageIdSchema = z.string().trim().min(1);

const imageUrlSchema = z.string().trim().url();

export const createGalleryImageSchema = z
  .object({
    title: z.string().trim().min(2).max(200),
    description: z.string().trim().max(3000).nullable().optional(),
    imageUrl: imageUrlSchema,
    altText: z.string().trim().min(1).max(300),
    category: z.string().trim().min(1).max(100).nullable().optional(),
    eventYear: z.number().int().min(2000).max(2100),
    sortOrder: z.number().int().min(0).max(100000).optional(),
    isPublished: z.boolean().optional(),
  })
  .strict();

export const updateGalleryImageSchema = createGalleryImageSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided.",
  });

export const updateGalleryVisibilitySchema = z
  .object({
    isPublished: z.boolean(),
  })
  .strict();

export const galleryImageIdParamSchema = z.object({
  id: imageIdSchema,
});

export const listGalleryQuerySchema = z.object({
  category: z.string().trim().min(1).max(100).optional(),
  eventYear: z.coerce.number().int().min(2000).max(2100).optional(),
});

export type CreateGalleryImageInput = z.infer<
  typeof createGalleryImageSchema
>;

export type UpdateGalleryImageInput = z.infer<
  typeof updateGalleryImageSchema
>;

export type UpdateGalleryVisibilityInput = z.infer<
  typeof updateGalleryVisibilitySchema
>;

export type ListGalleryQuery = z.infer<typeof listGalleryQuerySchema>;