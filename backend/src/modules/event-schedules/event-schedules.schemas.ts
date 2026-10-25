import { z } from "zod";

const scheduleFields = {
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2000).nullable().optional(),
  venue: z.string().trim().max(250).nullable().optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  sortOrder: z.number().int().min(0).max(10000).optional(),
};

const scheduleObjectSchema = z.object(scheduleFields).strict();

export const eventIdParamSchema = z.object({ eventId: z.string().min(1) }).strict();
export const scheduleIdParamSchema = z.object({ scheduleId: z.string().min(1) }).strict();

export const createScheduleSchema = scheduleObjectSchema.refine(
  (data) => data.endTime > data.startTime,
  { message: "Schedule end time must be after its start time.", path: ["endTime"] },
);

export const updateScheduleSchema = scheduleObjectSchema.partial().refine(
  (data) => data.startTime === undefined || data.endTime === undefined || data.endTime > data.startTime,
  { message: "Schedule end time must be after its start time.", path: ["endTime"] },
);

export const reorderSchedulesSchema = z.object({
  items: z.array(z.object({ id: z.string().min(1), sortOrder: z.number().int().min(0).max(10000) }).strict()).min(1).max(200),
}).strict().refine((data) => new Set(data.items.map((item) => item.id)).size === data.items.length, {
  message: "Each schedule ID may appear only once.", path: ["items"],
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
export type ReorderSchedulesInput = z.infer<typeof reorderSchedulesSchema>;
