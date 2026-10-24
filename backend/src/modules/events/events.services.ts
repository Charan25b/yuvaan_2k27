import { Prisma } from "../../generated/client.js";
import { prisma } from "../../lib/prisma.js";
import type {
  CreateEventInput,
  ListEventsQuery,
  UpdateEventInput,
} from "./events.schemas.js";

export class EventServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "EventServiceError";
  }
}

export async function listEvents(query: ListEventsQuery) {
  const {
    page,
    limit,
    categoryId,
    search,
    sort,
    order,
  } = query;

  const where: Prisma.EventWhereInput = {
    status: "PUBLISHED",

    ...(categoryId ? { categoryId } : {}),

    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [events, total] = await prisma.$transaction([
    prisma.event.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sort]: order },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),

    prisma.event.count({ where }),
  ]);

  return {
    items: events,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getEventBySlug(slug: string) {
  const event = await prisma.event.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      schedules: {
        orderBy: [{ startTime: "asc" }, { sortOrder: "asc" }],
      },
    },
  });

  if (!event) {
    throw new EventServiceError(
      "EVENT_NOT_FOUND",
      "The requested event was not found.",
    );
  }

  return event;
}

export async function createEvent(input: CreateEventInput) {
  if (input.startTime <= new Date()) {
    throw new EventServiceError(
      "INVALID_EVENT_START",
      "A new event must start in the future.",
    );
  }

  const category = await prisma.eventCategory.findUnique({
    where: { id: input.categoryId },
    select: { id: true, isActive: true },
  });

  if (!category || !category.isActive) {
    throw new EventServiceError(
      "INVALID_EVENT_CATEGORY",
      "The selected category does not exist or is inactive.",
    );
  }

  try {
    return await prisma.event.create({
      data: {
        status: "DRAFT",
        title: input.title,
        slug: input.slug,
        description: input.description,
        categoryId: input.categoryId,
        startTime: input.startTime,
        endTime: input.endTime,
        ...(input.venue !== undefined ? { venue: input.venue } : {}),
        ...(input.registrationDeadline !== undefined
          ? { registrationDeadline: input.registrationDeadline }
          : {}),
        ...(input.maxParticipants !== undefined
          ? { maxParticipants: input.maxParticipants }
          : {}),
        ...(input.coverImageUrl !== undefined
          ? { coverImageUrl: input.coverImageUrl }
          : {}),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new EventServiceError(
        "EVENT_SLUG_CONFLICT",
        "An event with this slug already exists.",
      );
    }

    throw error;
  }
}

export async function updateEvent(
  eventId: string,
  input: UpdateEventInput,
) {
  const existing = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!existing) {
    throw new EventServiceError(
      "EVENT_NOT_FOUND",
      "The requested event was not found.",
    );
  }

  const startTime = input.startTime ?? existing.startTime;
  const endTime = input.endTime ?? existing.endTime;

  if (endTime <= startTime) {
    throw new EventServiceError(
      "INVALID_EVENT_TIME",
      "Event end time must be after its start time.",
    );
  }

  const registrationDeadline =
    input.registrationDeadline === undefined
      ? existing.registrationDeadline
      : input.registrationDeadline;

  if (
    registrationDeadline !== null &&
    registrationDeadline !== undefined &&
    registrationDeadline > startTime
  ) {
    throw new EventServiceError(
      "INVALID_REGISTRATION_DEADLINE",
      "Registration deadline cannot be after the event starts.",
    );
  }

  if (input.categoryId !== undefined) {
    const category = await prisma.eventCategory.findUnique({
      where: { id: input.categoryId },
      select: { isActive: true },
    });

    if (!category || !category.isActive) {
      throw new EventServiceError(
        "INVALID_EVENT_CATEGORY",
        "The selected category does not exist or is inactive.",
      );
    }
  }

  try {
    const { categoryId, ...eventInput } = input;
    const data: Prisma.EventUpdateInput = {
      ...Object.fromEntries(
        Object.entries(eventInput).filter(([, value]) => value !== undefined),
      ),
      ...(categoryId !== undefined
        ? { category: { connect: { id: categoryId } } }
        : {}),
    };

    return await prisma.event.update({
      where: { id: eventId },
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new EventServiceError(
        "EVENT_SLUG_CONFLICT",
        "An event with this slug already exists.",
      );
    }

    throw error;
  }
}

export async function updateEventStatus(
  eventId: string,
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED",
) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      category: {
        select: { isActive: true },
      },
    },
  });

  if (!event) {
    throw new EventServiceError(
      "EVENT_NOT_FOUND",
      "The requested event was not found.",
    );
  }

  if (status === "PUBLISHED") {
    if (!event.category.isActive) {
      throw new EventServiceError(
        "INACTIVE_EVENT_CATEGORY",
        "Events cannot be published under inactive categories.",
      );
    }

    if (event.startTime <= new Date()) {
      throw new EventServiceError(
        "INVALID_EVENT_START",
        "An event that has already started cannot be published.",
      );
    }
  }

  return prisma.event.update({
    where: { id: eventId },
    data: { status },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}