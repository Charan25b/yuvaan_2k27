import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
  emailVerifiedAt: Date | null;
};

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUser;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.session.userId;

if (!userId) {
  res.status(401).json({
    error: "UNAUTHENTICATED",
    message: "Please log in to continue.",
  });
  return;
}

    const user = await prisma.user.findUnique({
  where: {
    id: userId,
  },
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
    emailVerifiedAt: true,
    sessionVersion: true,
  },
});

if (
  !user ||
  !user.emailVerifiedAt ||
  req.session.sessionVersion !== user.sessionVersion
) {
  if (
  !user ||
  !user.emailVerifiedAt ||
  req.session.sessionVersion !== user.sessionVersion
) {
  req.session.destroy((error) => {
    if (error) {
      next(error);
      return;
    }

    res.clearCookie("yuvaan.sid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHENTICATED",
        message: "Your session is invalid or has expired. Please log in again.",
      },
    });
  });

  return;
}
    }

    req.authUser = user;
    next();
  } catch (error) {
    next(error);
  }
}

