import type { RequestHandler } from "express";
import type { UserRole } from "../../generated/client.js";

export function requireRole(
  ...allowedRoles: UserRole[]
): RequestHandler {
  return (req, res, next) => {
    const user = req.authUser;

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "Please log in to continue.",
        },
      });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to perform this action.",
        },
      });
      return;
    }

    next();
  };
}