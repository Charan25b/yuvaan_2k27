import { Prisma } from "../../generated/client.js";
import { prisma } from "../../lib/prisma.js";

import type {
  CreateAnnouncementInput,
  ListAnnouncementsQuery,
  UpdateAnnouncementInput,
  UpdateAnnouncementPublicationInput,
} from "./announcements.schemas.js";

export class AnnouncementServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AnnouncementServiceError";
  }
}

const announcementSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  content: true,
  category: true,
  isPublished: true,
  publishedAt: true,
  expiresAt: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
} as const;

function handleDatabaseError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AnnouncementServiceError(
      "ANNOUNCEMENT_CONFLICT",
      "An announcement with this slug already exists.",
    );
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    throw new AnnouncementServiceError(
      "ANNOUNCEMENT_NOT_FOUND",
      "The requested announcement was not found.",
    );
  }

  throw error;
}

function getPublicVisibilityFilter() {
  const now = new Date();

  return {
    isPublished: true,
    publishedAt: {
      lte: now,
    },
    OR: [
      { expiresAt: null },
      { expiresAt: { gt: now } },
    ],
  } satisfies Prisma.AnnouncementWhereInput;
}

function getPagination(query: ListAnnouncementsQuery) {
  return {
    skip: (query.page - 1) * query.limit,
    take: query.limit,
  };
}

export async function listPublicAnnouncements(
  query: ListAnnouncementsQuery,
) {
  const where: Prisma.AnnouncementWhereInput = {
    ...getPublicVisibilityFilter(),
    ...(query.category ? { category: query.category } : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.announcement.findMany({
      where,
      select: announcementSelect,
      orderBy: [
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
      ...getPagination(query),
    }),
    prisma.announcement.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getPublicAnnouncementBySlug(slug: string) {
  const announcement = await prisma.announcement.findFirst({
    where: {
      slug,
      ...getPublicVisibilityFilter(),
    },
    select: announcementSelect,
  });

  if (!announcement) {
    throw new AnnouncementServiceError(
      "ANNOUNCEMENT_NOT_FOUND",
      "The requested announcement was not found.",
    );
  }

  return announcement;
}

export async function listAnnouncementsForAdmin(
  query: ListAnnouncementsQuery,
) {
  const where: Prisma.AnnouncementWhereInput = {
    ...(query.category ? { category: query.category } : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.announcement.findMany({
      where,
      select: announcementSelect,
      orderBy: [
        { createdAt: "desc" },
      ],
      ...getPagination(query),
    }),
    prisma.announcement.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getAnnouncementById(id: string) {
  const announcement = await prisma.announcement.findUnique({
    where: { id },
    select: announcementSelect,
  });

  if (!announcement) {
    throw new AnnouncementServiceError(
      "ANNOUNCEMENT_NOT_FOUND",
      "The requested announcement was not found.",
    );
  }

  return announcement;
}

export async function createAnnouncement(
  input: CreateAnnouncementInput,
  createdById: string,
) {
  const isPublished = input.isPublished ?? false;

  const publishedAt =
    input.publishedAt !== undefined
      ? input.publishedAt
      : isPublished
        ? new Date()
        : null;

  if (
    input.expiresAt != null &&
    publishedAt != null &&
    input.expiresAt <= publishedAt
  ) {
    throw new AnnouncementServiceError(
      "ANNOUNCEMENT_INVALID_DATES",
      "Expiration must be later than publication time.",
    );
  }

  try {
    return await prisma.announcement.create({
      data: {
        title: input.title,
        slug: input.slug,
        content: input.content,
        isPublished,
        createdById,
        ...(input.summary !== undefined
          ? { summary: input.summary }
          : {}),
        ...(input.category !== undefined
          ? { category: input.category }
          : {}),
        publishedAt,
        ...(input.expiresAt !== undefined
          ? { expiresAt: input.expiresAt }
          : {}),
      },
      select: announcementSelect,
    });
  } catch (error) {
    handleDatabaseError(error);
  }
}

export async function updateAnnouncement(
  id: string,
  input: UpdateAnnouncementInput,
) {
  const existing = await prisma.announcement.findUnique({
    where: { id },
    select: {
      id: true,
      publishedAt: true,
      expiresAt: true,
    },
  });

  if (!existing) {
    throw new AnnouncementServiceError(
      "ANNOUNCEMENT_NOT_FOUND",
      "The requested announcement was not found.",
    );
  }

  const nextPublishedAt =
    input.publishedAt !== undefined
      ? input.publishedAt
      : existing.publishedAt;

  const nextExpiresAt =
    input.expiresAt !== undefined
      ? input.expiresAt
      : existing.expiresAt;

  if (
    nextExpiresAt != null &&
    nextPublishedAt != null &&
    nextExpiresAt <= nextPublishedAt
  ) {
    throw new AnnouncementServiceError(
      "ANNOUNCEMENT_INVALID_DATES",
      "Expiration must be later than publication time.",
    );
  }

  try {
    return await prisma.announcement.update({
      where: { id },
      data: {
        ...(input.title !== undefined
          ? { title: input.title }
          : {}),
        ...(input.slug !== undefined
          ? { slug: input.slug }
          : {}),
        ...(input.summary !== undefined
          ? { summary: input.summary }
          : {}),
        ...(input.content !== undefined
          ? { content: input.content }
          : {}),
        ...(input.category !== undefined
          ? { category: input.category }
          : {}),
        ...(input.publishedAt !== undefined
          ? { publishedAt: input.publishedAt }
          : {}),
        ...(input.expiresAt !== undefined
          ? { expiresAt: input.expiresAt }
          : {}),
      },
      select: announcementSelect,
    });
  } catch (error) {
    handleDatabaseError(error);
  }
}

export async function updateAnnouncementPublication(
  id: string,
  input: UpdateAnnouncementPublicationInput,
) {
  const existing = await prisma.announcement.findUnique({
    where: { id },
    select: {
      id: true,
      publishedAt: true,
    },
  });

  if (!existing) {
    throw new AnnouncementServiceError(
      "ANNOUNCEMENT_NOT_FOUND",
      "The requested announcement was not found.",
    );
  }

  return prisma.announcement.update({
    where: { id },
    data: {
      isPublished: input.isPublished,
      ...(input.isPublished && existing.publishedAt === null
        ? { publishedAt: new Date() }
        : {}),
    },
    select: announcementSelect,
  });
}

export async function deleteAnnouncement(id: string) {
  try {
    await prisma.announcement.delete({
      where: { id },
      select: { id: true },
    });
  } catch (error) {
    handleDatabaseError(error);
  }
}