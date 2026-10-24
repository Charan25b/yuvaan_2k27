import { Prisma } from "../../generated/client.js";
import { prisma } from "../../lib/prisma.js";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  UpdateCategoryStatusInput,
} from "./event-categories.schemas.js";

export class EventCategoryServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "EventCategoryServiceError";
  }
}

function throwCategoryConflict(error: unknown): void {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new EventCategoryServiceError(
      "CATEGORY_CONFLICT",
      "A category with this name or slug already exists.",
    );
  }

  throw error;
}

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function listCategories() {
  return prisma.eventCategory.findMany({
    where: { isActive: true },
    select: categorySelect,
    orderBy: { name: "asc" },
  });
}

export async function getCategoryById(id: string) {
  const category = await prisma.eventCategory.findFirst({
    where: {
      id,
      isActive: true,
    },
    select: categorySelect,
  });

  if (!category) {
    throw new EventCategoryServiceError(
      "CATEGORY_NOT_FOUND",
      "The requested category was not found.",
    );
  }

  return category;
}

export async function createCategory(input: CreateCategoryInput) {
  try {
    return await prisma.eventCategory.create({
      data: {
        name: input.name,
        slug: input.slug,
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
      },
      select: categorySelect,
    });
  } catch (error) {
    throwCategoryConflict(error);
  }
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
) {
  const existing = await prisma.eventCategory.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new EventCategoryServiceError(
      "CATEGORY_NOT_FOUND",
      "The requested category was not found.",
    );
  }

  try {
    return await prisma.eventCategory.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
      },
      select: categorySelect,
    });
  } catch (error) {
    throwCategoryConflict(error);
  }
}

export async function updateCategoryStatus(
  id: string,
  input: UpdateCategoryStatusInput,
) {
  const existing = await prisma.eventCategory.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new EventCategoryServiceError(
      "CATEGORY_NOT_FOUND",
      "The requested category was not found.",
    );
  }

  return prisma.eventCategory.update({
    where: { id },
    data: { isActive: input.isActive },
    select: categorySelect,
  });
}