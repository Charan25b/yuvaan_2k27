import { Prisma } from "../../generated/client.js";
import { prisma } from "../../lib/prisma.js";

import type {
  CreateMerchandiseInput,
  UpdateMerchandiseInput,
} from "./merchandise.schemas.js";

export class MerchandiseServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "MerchandiseServiceError";
  }
}

const merchandiseSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  price: true,
  orderFormUrl: true,
  availability: true,
  sortOrder: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
} as const;

function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw new MerchandiseServiceError(
        "MERCHANDISE_SLUG_CONFLICT",
        "A merchandise item with this slug already exists.",
      );
    }

    if (error.code === "P2025") {
      throw new MerchandiseServiceError(
        "MERCHANDISE_NOT_FOUND",
        "The requested merchandise item was not found.",
      );
    }
  }

  throw error;
}

function toDecimal(
  price: number | null | undefined,
): Prisma.Decimal | null | undefined {
  if (price === undefined) return undefined;
  if (price === null) return null;

  return new Prisma.Decimal(price);
}

// PUBLIC: List published merchandise only.
export async function listPublicMerchandise() {
  return prisma.merchandise.findMany({
    where: { isPublished: true },
    select: merchandiseSelect,
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  });
}

// PUBLIC: Get a published item by slug.
export async function getPublicMerchandise(slug: string) {
  const item = await prisma.merchandise.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    select: merchandiseSelect,
  });

  if (!item) {
    throw new MerchandiseServiceError(
      "MERCHANDISE_NOT_FOUND",
      "The requested merchandise item was not found.",
    );
  }

  return item;
}

// ADMIN: List published and unpublished items.
export async function listMerchandiseForAdmin() {
  return prisma.merchandise.findMany({
    select: merchandiseSelect,
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  });
}

// ADMIN: Get any item by ID.
export async function getMerchandiseForAdmin(id: string) {
  const item = await prisma.merchandise.findUnique({
    where: { id },
    select: merchandiseSelect,
  });

  if (!item) {
    throw new MerchandiseServiceError(
      "MERCHANDISE_NOT_FOUND",
      "The requested merchandise item was not found.",
    );
  }

  return item;
}

// ADMIN: Create a listing. Unpublished by default.
export async function createMerchandise(
  input: CreateMerchandiseInput,
) {
  try {
    const price = toDecimal(input.price);

    return await prisma.merchandise.create({
      data: {
        name: input.name,
        slug: input.slug,
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.imageUrl !== undefined
          ? { imageUrl: input.imageUrl }
          : {}),
        ...(price !== undefined ? { price } : {}),
        ...(input.orderFormUrl !== undefined
          ? { orderFormUrl: input.orderFormUrl }
          : {}),
        ...(input.availability !== undefined
          ? { availability: input.availability }
          : {}),
        ...(input.sortOrder !== undefined
          ? { sortOrder: input.sortOrder }
          : {}),
        ...(input.isPublished !== undefined
          ? { isPublished: input.isPublished }
          : {}),
      },
      select: merchandiseSelect,
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

// ADMIN: Update a listing.
export async function updateMerchandise(
  id: string,
  input: UpdateMerchandiseInput,
) {
  try {
    const price = toDecimal(input.price);

    return await prisma.merchandise.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.imageUrl !== undefined
          ? { imageUrl: input.imageUrl }
          : {}),
        ...(price !== undefined ? { price } : {}),
        ...(input.orderFormUrl !== undefined
          ? { orderFormUrl: input.orderFormUrl }
          : {}),
        ...(input.availability !== undefined
          ? { availability: input.availability }
          : {}),
        ...(input.sortOrder !== undefined
          ? { sortOrder: input.sortOrder }
          : {}),
        ...(input.isPublished !== undefined
          ? { isPublished: input.isPublished }
          : {}),
      },
      select: merchandiseSelect,
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

// ADMIN: Publish or unpublish an item.
export async function updateMerchandiseVisibility(
  id: string,
  isPublished: boolean,
) {
  try {
    return await prisma.merchandise.update({
      where: { id },
      data: { isPublished },
      select: merchandiseSelect,
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

// ADMIN: Delete a listing.
export async function deleteMerchandise(id: string) {
  try {
    await prisma.merchandise.delete({
      where: { id },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}