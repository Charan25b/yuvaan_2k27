import { z } from "zod";

const eventFields = {
  title: z.string().trim().min(3).max(150),

  slug: z
    .string()
    .trim()
    .min(3)
    .max(160)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers, and hyphens only.",
    ),

  description: z.string().trim().min(10).max(10000),

  categoryId: z.string().min(1),

  venue: z.string().trim().max(250).nullable().optional(),

  startTime: z.coerce.date(),

  endTime: z.coerce.date(),

  registrationDeadline: z.coerce.date().nullable().optional(),

  maxParticipants: z.number().int().positive().nullable().optional(),

  coverImageUrl: z
    .string()
    .trim()
    .url()
    .max(2048)
    .nullable()
    .optional(),
};

/**
 * Keep this schema free of refinements.
 *
 * Zod 4 does not allow .partial() on an object schema
 * that already contains refinements.
 */
const eventObjectSchema = z.object(eventFields).strict();

/**
 * Validate a complete event creation payload.
 */
export const createEventSchema = eventObjectSchema
  .refine((data) => data.endTime > data.startTime, {
    message: "Event end time must be after its start time.",
    path: ["endTime"],
  })
  .refine(
    (data) =>
      data.registrationDeadline == null ||
      data.registrationDeadline <= data.startTime,
    {
      message: "Registration deadline must be on or before the event start time.",
      path: ["registrationDeadline"],
    },
  );

/**
 * Validate partial updates.
 *
 * Apply .partial() before adding refinements to avoid
 * the Zod 4 startup error.
 */
export const updateEventSchema = eventObjectSchema
  .partial()
  .refine(
    (data) =>
      data.startTime === undefined ||
      data.endTime === undefined ||
      data.endTime > data.startTime,
    {
      message: "Event end time must be after its start time.",
      path: ["endTime"],
    },
  )
  .refine(
    (data) =>
      data.registrationDeadline == null ||
      data.startTime === undefined ||
      data.registrationDeadline <= data.startTime,
    {
      message: "Registration deadline must be on or before the event start time.",
      path: ["registrationDeadline"],
    },
  );

export const eventIdParamSchema = z
  .object({
    eventId: z.string().min(1),
  })
  .strict();

export const eventSlugParamSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .max(160)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  })
  .strict();

export const listEventsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),

    categoryId: z.string().min(1).optional(),

    search: z.string().trim().min(1).max(100).optional(),

    sort: z.enum(["startTime", "createdAt"]).default("startTime"),

    order: z.enum(["asc", "desc"]).default("asc"),
  })
  .strict();

export const updateEventStatusSchema = z
  .object({
    status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]),
  })
  .strict();

export type CreateEventInput = z.infer<typeof createEventSchema>;

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;

export type UpdateEventStatusInput = z.infer<typeof updateEventStatusSchema>;
