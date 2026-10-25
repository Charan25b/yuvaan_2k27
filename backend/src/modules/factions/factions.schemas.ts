import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must contain lowercase letters, numbers, and hyphens only.",
  );

export const createFactionSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    slug: slugSchema,
    description: z.string().trim().max(1000).nullable().optional(),
    color: z
      .string()
      .trim()
      .regex(
        /^#[0-9a-fA-F]{6}$/,
        "Color must be a valid hex color.",
      )
      .optional(),
    emblemUrl: z.string().trim().url().max(2048).nullable().optional(),
  })
  .strict();

export const updateFactionSchema = createFactionSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided.",
  );

export const factionIdParamSchema = z.object({
  factionId: z.string().min(1),
});

export const assignFactionSchema = z
  .object({
    userId: z.string().min(1),
    factionId: z.string().min(1),
  })
  .strict();

export const updateFactionStatusSchema = z
  .object({
    isActive: z.boolean(),
  })
  .strict();

export const listFactionsQuerySchema = z
  .object({
    includeInactive: z.enum(["true", "false"]).default("false"),
  })
  .strict();

export const factionMembersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export type CreateFactionInput = z.infer<typeof createFactionSchema>;
export type UpdateFactionInput = z.infer<typeof updateFactionSchema>;