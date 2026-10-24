import { randomBytes, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function isValidToken(received: string, expected: string): boolean {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(receivedBuffer, expectedBuffer);
}

export function csrfTokenHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.session.csrfToken) {
    req.session.csrfToken = randomBytes(32).toString("base64url");
  }

  req.session.save((error) => {
    if (error) {
      next(error);
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        csrfToken: req.session.csrfToken,
      },
    });
  });
}

export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const expectedToken = req.session.csrfToken;
  const receivedToken = req.get("X-CSRF-Token");

  if (
    !expectedToken ||
    !receivedToken ||
    receivedToken.length > 200 ||
    !/^[A-Za-z0-9_-]+$/.test(receivedToken) ||
    !isValidToken(receivedToken, expectedToken)
  ) {
    res.status(403).json({
      success: false,
      error: {
        code: "CSRF_VALIDATION_FAILED",
        message: "The request could not be verified. Refresh and try again.",
      },
    });
    return;
  }

  next();
}

