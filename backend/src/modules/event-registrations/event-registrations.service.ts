import { Prisma } from "../../generated/client.js";
import { prisma } from "../../lib/prisma.js";
import type {
  ListRegistrationsQuery,
  UpdateAttendanceInput,
} from "./event-registrations.schemas.js";

export class EventRegistrationServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "EventRegistrationServiceError";
  }
}

/**
 * Register the authenticated user for a published event.
 *
 * Locking the event row serializes registration attempts for that event,
 * ensuring concurrent requests cannot exceed maxParticipants.
 */
export async function registerForEvent(
  userId: string,
  eventId: string,
) {
  try {
    return await prisma.$transaction(async (tx) => {
      // Lock the event row until this transaction completes.
      // The table name is "events" because Event uses @@map("events").
      const lockedEvents = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT id
        FROM events
        WHERE id = ${eventId}
        FOR UPDATE
      `;

      if (lockedEvents.length === 0) {
        throw new EventRegistrationServiceError(
          "EVENT_NOT_FOUND",
          "The requested event was not found.",
        );
      }

      const event = await tx.event.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          title: true,
          status: true,
          startTime: true,
          registrationDeadline: true,
          maxParticipants: true,
          category: {
            select: {
              isActive: true,
            },
          },
        },
      });

      if (!event || event.status !== "PUBLISHED" || !event.category.isActive) {
        throw new EventRegistrationServiceError(
          "EVENT_NOT_AVAILABLE",
          "This event is not available for registration.",
        );
      }

      const now = new Date();

      if (event.startTime <= now) {
        throw new EventRegistrationServiceError(
          "REGISTRATION_CLOSED",
          "Registration is closed because the event has already started.",
        );
      }

      if (
        event.registrationDeadline !== null &&
        event.registrationDeadline <= now
      ) {
        throw new EventRegistrationServiceError(
          "REGISTRATION_CLOSED",
          "The registration deadline has passed.",
        );
      }

      // Check duplicates before checking capacity so existing registrations
      // receive a useful error even when the event is full.
      const existingRegistration = await tx.eventRegistration.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId,
          },
        },
        select: { id: true },
      });

      if (existingRegistration) {
        throw new EventRegistrationServiceError(
          "ALREADY_REGISTERED",
          "You are already registered for this event.",
        );
      }

      if (event.maxParticipants !== null) {
        const registrationCount = await tx.eventRegistration.count({
          where: { eventId },
        });

        if (registrationCount >= event.maxParticipants) {
          throw new EventRegistrationServiceError(
            "EVENT_FULL",
            "This event has reached its registration capacity.",
          );
        }
      }

      return tx.eventRegistration.create({
        data: {
          userId,
          eventId,
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
              startTime: true,
              endTime: true,
              venue: true,
            },
          },
        },
      });
    });
  } catch (error) {
    if (error instanceof EventRegistrationServiceError) {
      throw error;
    }

    // The database unique constraint is the final defense against duplicates.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new EventRegistrationServiceError(
        "ALREADY_REGISTERED",
        "You are already registered for this event.",
      );
    }

    throw error;
  }
}

/**
 * List the authenticated user's registrations.
 */
export async function listMyRegistrations(
  userId: string,
  query: ListRegistrationsQuery,
) {
  const { page, limit } = query;

  const where: Prisma.EventRegistrationWhereInput = {
    userId,
  };

  const [items, total] = await prisma.$transaction([
    prisma.eventRegistration.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { registeredAt: "desc" },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            status: true,
            startTime: true,
            endTime: true,
            venue: true,
            coverImageUrl: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    }),
    prisma.eventRegistration.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * List registrations for a particular event.
 * Protect this operation with administrator authorization in the router.
 */
export async function listEventRegistrations(
  eventId: string,
  query: ListRegistrationsQuery,
) {
  const { page, limit } = query;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
    },
  });

  if (!event) {
    throw new EventRegistrationServiceError(
      "EVENT_NOT_FOUND",
      "The requested event was not found.",
    );
  }

  const where: Prisma.EventRegistrationWhereInput = {
    eventId,
  };

  const [items, total] = await prisma.$transaction([
    prisma.eventRegistration.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { registeredAt: "asc" },
      select: {
        id: true,
        registeredAt: true,
        participatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.eventRegistration.count({ where }),
  ]);

  return {
    event,
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Mark attendance or correct an accidental check-in.
 * Protect this operation with administrator authorization in the router.
 */
export async function updateRegistrationAttendance(
  registrationId: string,
  input: UpdateAttendanceInput,
) {
  const existing = await prisma.eventRegistration.findUnique({
    where: { id: registrationId },
    select: { id: true },
  });

  if (!existing) {
    throw new EventRegistrationServiceError(
      "REGISTRATION_NOT_FOUND",
      "The requested registration was not found.",
    );
  }

  return prisma.eventRegistration.update({
    where: { id: registrationId },
    data: {
      participatedAt: input.attended ? new Date() : null,
    },
    select: {
      id: true,
      registeredAt: true,
      participatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });
}