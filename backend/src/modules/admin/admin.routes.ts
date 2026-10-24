import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { requireRole } from "../auth/authorization.middleware.js";

export const adminRouter = Router();

const updateUserRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  search: z.string().trim().max(100).default(""),

  role: z.enum(["USER", "ADMIN", "SUPERADMIN"]).optional(),
});

adminRouter.patch(
  "/users/:userId/role",
  requireAuth,
  requireRole("SUPERADMIN"),
  async (req, res, next) => {
    try {
      const params = z.object({
        userId: z.string().min(1),
      }).safeParse(req.params);

      const body = updateUserRoleSchema.safeParse(req.body);

      if (!params.success || !body.success) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid user ID or role.",
          },
        });
        return;
      }

      const { userId } = params.data;
      const { role } = body.data;

      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (!targetUser) {
        res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found.",
          },
        });
        return;
      }

      if (targetUser.role === "SUPERADMIN") {
        res.status(403).json({
          success: false,
          error: {
            code: "SUPERADMIN_PROTECTED",
            message: "Superadmin roles cannot be changed through this endpoint.",
          },
        });
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      res.status(200).json({
        success: true,
        data: {
          user: updatedUser,
          message: `User role updated to ${role}.`,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.get(
  "/users",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  async (req, res, next) => {
    try {
      const parsed = listUsersQuerySchema.safeParse(req.query);

      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid pagination, search, or role parameters.",
          },
        });
        return;
      }

      const { page, limit, search, role } = parsed.data;

      const where = {
        ...(role ? { role } : {}),
        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  email: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {}),
      };

      const [users, total] = await prisma.$transaction([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            emailVerifiedAt: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          skip: (page - 1) * limit,
          take: limit,
        }),

        prisma.user.count({ where }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPreviousPage: page > 1,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.get(
  "/users/:userId",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  async (req, res, next) => {
    try {
      const params = z
        .object({
          userId: z.string().min(1),
        })
        .safeParse(req.params);

      if (!params.success) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid user ID.",
          },
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: {
          id: params.data.userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerifiedAt: true,
          createdAt: true,
          updatedAt: true,
          accounts: {
            select: {
              provider: true,
              createdAt: true,
            },
          },
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found.",
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.get(
  "/stats",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  async (_req, res, next) => {
    try {
      const [
        totalUsers,
        totalAdmins,
        totalSuperadmins,
        verifiedUsers,
        unverifiedUsers,
        recentUsers,
      ] = await prisma.$transaction([
        prisma.user.count(),

        prisma.user.count({
          where: { role: "ADMIN" },
        }),

        prisma.user.count({
          where: { role: "SUPERADMIN" },
        }),

        prisma.user.count({
          where: {
            emailVerifiedAt: { not: null },
          },
        }),

        prisma.user.count({
          where: {
            emailVerifiedAt: null,
          },
        }),

        prisma.user.findMany({
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          users: {
            total: totalUsers,
            regular: totalUsers - totalAdmins - totalSuperadmins,
            admins: totalAdmins,
            superadmins: totalSuperadmins,
            verified: verifiedUsers,
            unverified: unverifiedUsers,
          },
          recentUsers,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);