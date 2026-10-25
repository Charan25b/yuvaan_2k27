import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(180)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must contain lowercase letters, numbers, and single hyphens.",
  );

const dateSchema = z.iso.datetime({ offset: true }).transform(
  (value) => new Date(value),
);

const announcementFields = {
  title: z.string().trim().min(3).max(200),
  slug: slugSchema,
  summary: z.string().trim().max(500).nullable().optional(),
  content: z.string().trim().min(1).max(20000),
  category: z
    .enum([
      "GENERAL",
      "EVENT",
      "REGISTRATION",
      "SCHEDULE",
      "IMPORTANT",
    ])
    .optional(),
  publishedAt: dateSchema.nullable().optional(),
  expiresAt: dateSchema.nullable().optional(),
};

export const createAnnouncementSchema = z
  .object({
    ...announcementFields,
    isPublished: z.boolean().optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.expiresAt == null ||
      data.publishedAt == null ||
      data.expiresAt > data.publishedAt,
    {
      message: "Expiration must be later than publication time.",
      path: ["expiresAt"],
    },
  );

export const updateAnnouncementSchema = z
  .object(announcementFields)
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  })
  .refine(
    (data) =>
      data.expiresAt == null ||
      data.publishedAt == null ||
      data.expiresAt > data.publishedAt,
    {
      message:
        "When both dates are provided, expiration must be later than publication time.",
      path: ["expiresAt"],
    },
  );

export const updateAnnouncementPublicationSchema = z
  .object({
    isPublished: z.boolean(),
  })
  .strict();

export const announcementIdParamSchema = z.object({
  id: z.string().trim().min(1).max(100),
});

export const announcementSlugParamSchema = z.object({
  slug: slugSchema,
});

export const listAnnouncementsQuerySchema = z.object({
  category: z
    .enum([
      "GENERAL",
      "EVENT",
      "REGISTRATION",
      "SCHEDULE",
      "IMPORTANT",
    ])
    .optional(),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateAnnouncementInput = z.infer<
  typeof createAnnouncementSchema
>;

export type UpdateAnnouncementInput = z.infer<
  typeof updateAnnouncementSchema
>;

export type UpdateAnnouncementPublicationInput = z.infer<
  typeof updateAnnouncementPublicationSchema
>;

export type ListAnnouncementsQuery = z.infer<
  typeof listAnnouncementsQuerySchema
>;