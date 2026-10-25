import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const optionalUrl = z.string().trim().url().nullable().optional();

export const createTeamSchema = z
  .object({
    name: z.string().trim().min(2).max(150),
    slug: slugSchema,
    description: z.string().trim().max(3000).nullable().optional(),
    logoUrl: optionalUrl,
    sortOrder: z.number().int().min(0).max(100000).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const updateTeamSchema = createTeamSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided.",
  });

export const createTeamMemberSchema = z
  .object({
    name: z.string().trim().min(2).max(150),
    designation: z.string().trim().min(1).max(150),
    bio: z.string().trim().max(3000).nullable().optional(),
    photoUrl: optionalUrl,
    sortOrder: z.number().int().min(0).max(100000).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const updateTeamMemberSchema = createTeamMemberSchema
  .extend({
    teamId: z.string().min(1).optional(),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided.",
  });

export const teamIdParamSchema = z.object({
  id: z.string().min(1),
});

export const teamSlugParamSchema = z.object({
  slug: slugSchema,
});

export const teamMemberIdParamSchema = z.object({
  memberId: z.string().min(1),
});

export const updateVisibilitySchema = z
  .object({
    isActive: z.boolean(),
  })
  .strict();

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;
export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>;