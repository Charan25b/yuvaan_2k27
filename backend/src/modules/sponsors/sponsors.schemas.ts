import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .url()
  .nullable()
  .optional();

const sponsorFields = {
  name: z.string().trim().min(2).max(150),

  slug: z
    .string()
    .trim()
    .min(2)
    .max(160)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers, and single hyphens.",
    ),

  description: z.string().trim().max(2000).nullable().optional(),

  logoUrl: optionalUrl,

  websiteUrl: optionalUrl,

  tier: z.string().trim().min(1).max(100),

  sortOrder: z.number().int().min(0).max(100000).optional(),
};

const sponsorObjectSchema = z.object(sponsorFields).strict();

export const createSponsorSchema = sponsorObjectSchema;

export const updateSponsorSchema = sponsorObjectSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export const sponsorIdParamSchema = z.object({
  id: z.string().min(1),
});

export const sponsorSlugParamSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export const updateSponsorStatusSchema = z
  .object({
    isActive: z.boolean(),
  })
  .strict();

export type CreateSponsorInput = z.infer<typeof createSponsorSchema>;

export type UpdateSponsorInput = z.infer<typeof updateSponsorSchema>;

export type UpdateSponsorStatusInput = z.infer<
  typeof updateSponsorStatusSchema
>;