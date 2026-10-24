import { z } from "zod";

export const eventIdParamSchema = z.object({
  eventId: z.string().min(1),
});

export const registrationIdParamSchema = z.object({
  registrationId: z.string().min(1),
});

export const listRegistrationsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const updateAttendanceSchema = z
  .object({
    attended: z.boolean(),
  })
  .strict();

export type ListRegistrationsQuery = z.infer<
  typeof listRegistrationsQuerySchema
>;

export type UpdateAttendanceInput = z.infer<
  typeof updateAttendanceSchema
>;