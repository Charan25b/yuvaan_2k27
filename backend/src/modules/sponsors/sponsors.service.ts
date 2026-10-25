import { Prisma } from "../../generated/client.js";
import { prisma } from "../../lib/prisma.js";

import type {
  CreateSponsorInput,
  UpdateSponsorInput,
  UpdateSponsorStatusInput,
} from "./sponsors.schemas.js";

export class SponsorServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "SponsorServiceError";
  }
}

const sponsorSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  logoUrl: true,
  websiteUrl: true,
  tier: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

function throwSponsorConflict(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new SponsorServiceError(
      "SPONSOR_CONFLICT",
      "A sponsor with this slug already exists.",
    );
  }

  throw error;
}

/**
 * Public listing.
 * Only active sponsors are returned.
 */
export async function listSponsors() {
  return prisma.sponsor.findMany({
    where: {
      isActive: true,
    },
    select: sponsorSelect,
    orderBy: [
      { sortOrder: "asc" },
      { name: "asc" },
    ],
  });
}

/**
 * Public sponsor details.
 */
export async function getSponsorBySlug(slug: string) {
  const sponsor = await prisma.sponsor.findFirst({
    where: {
      slug,
      isActive: true,
    },
    select: sponsorSelect,
  });

  if (!sponsor) {
    throw new SponsorServiceError(
      "SPONSOR_NOT_FOUND",
      "The requested sponsor was not found.",
    );
  }

  return sponsor;
}

/**
 * Administrative listing.
 * Includes active and inactive sponsors.
 */
export async function listSponsorsForAdmin() {
  return prisma.sponsor.findMany({
    select: sponsorSelect,
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  });
}

/**
 * Administrative details.
 * Includes inactive sponsors.
 */
export async function getSponsorById(id: string) {
  const sponsor = await prisma.sponsor.findUnique({
    where: { id },
    select: sponsorSelect,
  });

  if (!sponsor) {
    throw new SponsorServiceError(
      "SPONSOR_NOT_FOUND",
      "The requested sponsor was not found.",
    );
  }

  return sponsor;
}

export async function createSponsor(input: CreateSponsorInput) {
  try {
    return await prisma.sponsor.create({
      data: {
        name: input.name,
        slug: input.slug,
        tier: input.tier,

        ...(input.description !== undefined
          ? { description: input.description }
          : {}),

        ...(input.logoUrl !== undefined
          ? { logoUrl: input.logoUrl }
          : {}),

        ...(input.websiteUrl !== undefined
          ? { websiteUrl: input.websiteUrl }
          : {}),

        ...(input.sortOrder !== undefined
          ? { sortOrder: input.sortOrder }
          : {}),
      },
      select: sponsorSelect,
    });
  } catch (error) {
    throwSponsorConflict(error);
  }
}

export async function updateSponsor(
  id: string,
  input: UpdateSponsorInput,
) {
  const existing = await prisma.sponsor.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new SponsorServiceError(
      "SPONSOR_NOT_FOUND",
      "The requested sponsor was not found.",
    );
  }

  try {
    return await prisma.sponsor.update({
      where: { id },
      data: {
        ...(input.name !== undefined
          ? { name: input.name }
          : {}),

        ...(input.slug !== undefined
          ? { slug: input.slug }
          : {}),

        ...(input.tier !== undefined
          ? { tier: input.tier }
          : {}),

        ...(input.description !== undefined
          ? { description: input.description }
          : {}),

        ...(input.logoUrl !== undefined
          ? { logoUrl: input.logoUrl }
          : {}),

        ...(input.websiteUrl !== undefined
          ? { websiteUrl: input.websiteUrl }
          : {}),

        ...(input.sortOrder !== undefined
          ? { sortOrder: input.sortOrder }
          : {}),
      },
      select: sponsorSelect,
    });
  } catch (error) {
    throwSponsorConflict(error);
  }
}

export async function updateSponsorStatus(
  id: string,
  input: UpdateSponsorStatusInput,
) {
  const existing = await prisma.sponsor.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new SponsorServiceError(
      "SPONSOR_NOT_FOUND",
      "The requested sponsor was not found.",
    );
  }

  return prisma.sponsor.update({
    where: { id },
    data: {
      isActive: input.isActive,
    },
    select: sponsorSelect,
  });
}

export async function deleteSponsor(id: string) {
  const existing = await prisma.sponsor.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new SponsorServiceError(
      "SPONSOR_NOT_FOUND",
      "The requested sponsor was not found.",
    );
  }

  await prisma.sponsor.delete({
    where: { id },
  });
}