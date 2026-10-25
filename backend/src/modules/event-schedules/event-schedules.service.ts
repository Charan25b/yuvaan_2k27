import { Prisma } from "../../generated/client.js";
import { prisma } from "../../lib/prisma.js";
import type { CreateScheduleInput, ReorderSchedulesInput, UpdateScheduleInput } from "./event-schedules.schemas.js";

export class EventScheduleServiceError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "EventScheduleServiceError";
  }
}

async function getParentEvent(eventId: string, publicOnly = false) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, ...(publicOnly ? { status: "PUBLISHED", category: { isActive: true } } : {}) },
    select: { id: true, startTime: true, endTime: true, status: true },
  });
  if (!event) throw new EventScheduleServiceError("EVENT_NOT_FOUND", "The requested event was not found.");
  return event;
}

function validateWithinEvent(startTime: Date, endTime: Date, eventStart: Date, eventEnd: Date) {
  if (endTime <= startTime) {
    throw new EventScheduleServiceError("INVALID_SCHEDULE_TIME", "Schedule end time must be after its start time.");
  }
  if (startTime < eventStart || endTime > eventEnd) {
    throw new EventScheduleServiceError("SCHEDULE_OUTSIDE_EVENT", "Schedule entries must fall within the parent event's start and end times.");
  }
}

export async function listEventSchedules(eventId: string, publicOnly = true) {
  await getParentEvent(eventId, publicOnly);
  return prisma.eventSchedule.findMany({
    where: { eventId },
    orderBy: [{ sortOrder: "asc" }, { startTime: "asc" }],
  });
}

export async function createEventSchedule(eventId: string, input: CreateScheduleInput) {
  const event = await getParentEvent(eventId);
  validateWithinEvent(input.startTime, input.endTime, event.startTime, event.endTime);
  return prisma.eventSchedule.create({
    data: {
      eventId,
      title: input.title,
      startTime: input.startTime,
      endTime: input.endTime,
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.venue !== undefined ? { venue: input.venue } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    },
  });
}

export async function updateEventSchedule(scheduleId: string, input: UpdateScheduleInput) {
  const existing = await prisma.eventSchedule.findUnique({ where: { id: scheduleId }, include: { event: { select: { startTime: true, endTime: true } } } });
  if (!existing) throw new EventScheduleServiceError("SCHEDULE_NOT_FOUND", "The requested schedule entry was not found.");

  const startTime = input.startTime ?? existing.startTime;
  const endTime = input.endTime ?? existing.endTime;
  validateWithinEvent(startTime, endTime, existing.event.startTime, existing.event.endTime);

  const data: Prisma.EventScheduleUpdateInput = {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.venue !== undefined ? { venue: input.venue } : {}),
    ...(input.startTime !== undefined ? { startTime: input.startTime } : {}),
    ...(input.endTime !== undefined ? { endTime: input.endTime } : {}),
    ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
  };
  return prisma.eventSchedule.update({ where: { id: scheduleId }, data });
}

export async function deleteEventSchedule(scheduleId: string) {
  const existing = await prisma.eventSchedule.findUnique({ where: { id: scheduleId }, select: { id: true } });
  if (!existing) throw new EventScheduleServiceError("SCHEDULE_NOT_FOUND", "The requested schedule entry was not found.");
  await prisma.eventSchedule.delete({ where: { id: scheduleId } });
  return { id: scheduleId, deleted: true };
}

export async function reorderEventSchedules(eventId: string, input: ReorderSchedulesInput) {
  await getParentEvent(eventId);
  const ids = input.items.map((item) => item.id);
  const ownedCount = await prisma.eventSchedule.count({ where: { eventId, id: { in: ids } } });
  if (ownedCount !== ids.length) {
    throw new EventScheduleServiceError("INVALID_SCHEDULE_IDS", "Every schedule ID must belong to the specified event.");
  }
  await prisma.$transaction(input.items.map(({ id, sortOrder }) => prisma.eventSchedule.update({ where: { id }, data: { sortOrder } })));
  return listEventSchedules(eventId, false);
}
