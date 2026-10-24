import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { requireRole } from "../auth/authorization.middleware.js";

export const adminRouter = Router();

const updateUserRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
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