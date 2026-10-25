import { Prisma } from "../../generated/client.js";
import { prisma } from "../../lib/prisma.js";

import type {
  CreateGalleryImageInput,
  UpdateGalleryImageInput,
  ListGalleryQuery,
} from "./gallery.schemas.js";

export class GalleryServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "GalleryServiceError";
  }
}

const galleryImageSelect = {
  id: true,
  title: true,
  description: true,
  imageUrl: true,
  altText: true,
  category: true,
  eventYear: true,
  sortOrder: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
} as const;

function handlePrismaError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    throw new GalleryServiceError(
      "GALLERY_IMAGE_NOT_FOUND",
      "The requested gallery image was not found.",
    );
  }

  throw error;
}

// PUBLIC: List published images with optional filters.
export async function listPublicGallery(query: ListGalleryQuery) {
  return prisma.galleryImage.findMany({
    where: {
      isPublished: true,
      ...(query.category !== undefined
        ? { category: query.category }
        : {}),
      ...(query.eventYear !== undefined
        ? { eventYear: query.eventYear }
        : {}),
    },
    select: galleryImageSelect,
    orderBy: [
      { eventYear: "desc" },
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  });
}

// PUBLIC: Retrieve a published image by ID.
export async function getPublicGalleryImage(id: string) {
  const image = await prisma.galleryImage.findFirst({
    where: {
      id,
      isPublished: true,
    },
    select: galleryImageSelect,
  });

  if (!image) {
    throw new GalleryServiceError(
      "GALLERY_IMAGE_NOT_FOUND",
      "The requested gallery image was not found.",
    );
  }

  return image;
}

// ADMIN: List all images, including unpublished images.
export async function listGalleryForAdmin(query: ListGalleryQuery) {
  return prisma.galleryImage.findMany({
    where: {
      ...(query.category !== undefined
        ? { category: query.category }
        : {}),
      ...(query.eventYear !== undefined
        ? { eventYear: query.eventYear }
        : {}),
    },
    select: galleryImageSelect,
    orderBy: [
      { eventYear: "desc" },
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  });
}

// ADMIN: Create an image. Draft by default.
export async function createGalleryImage(input: CreateGalleryImageInput) {
  return prisma.galleryImage.create({
    data: {
      title: input.title,
      imageUrl: input.imageUrl,
      altText: input.altText,
      eventYear: input.eventYear,
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.category !== undefined
        ? { category: input.category }
        : {}),
      ...(input.sortOrder !== undefined
        ? { sortOrder: input.sortOrder }
        : {}),
      ...(input.isPublished !== undefined
        ? { isPublished: input.isPublished }
        : {}),
    },
    select: galleryImageSelect,
  });
}

// ADMIN: Update an image.
export async function updateGalleryImage(
  id: string,
  input: UpdateGalleryImageInput,
) {
  try {
    return await prisma.galleryImage.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.imageUrl !== undefined
          ? { imageUrl: input.imageUrl }
          : {}),
        ...(input.altText !== undefined ? { altText: input.altText } : {}),
        ...(input.category !== undefined
          ? { category: input.category }
          : {}),
        ...(input.eventYear !== undefined
          ? { eventYear: input.eventYear }
          : {}),
        ...(input.sortOrder !== undefined
          ? { sortOrder: input.sortOrder }
          : {}),
        ...(input.isPublished !== undefined
          ? { isPublished: input.isPublished }
          : {}),
      },
      select: galleryImageSelect,
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

// ADMIN: Publish or unpublish an image.
export async function updateGalleryVisibility(
  id: string,
  isPublished: boolean,
) {
  try {
    return await prisma.galleryImage.update({
      where: { id },
      data: { isPublished },
      select: galleryImageSelect,
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

// ADMIN: Delete an image.
export async function deleteGalleryImage(id: string) {
  try {
    await prisma.galleryImage.delete({
      where: { id },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}