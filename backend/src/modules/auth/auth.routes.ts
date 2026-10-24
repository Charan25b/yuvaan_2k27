import { Router } from "express";

import { registerSchema } from "./auth.schemas.js";
import { registerUser } from "./auth.service.js";
import { sendVerificationEmail } from "../../lib/email.js";
import { verifyEmailSchema } from "./auth.schemas.js";
import { verifyUserEmail } from "./auth.service.js";
import { resendVerificationSchema } from "./auth.schemas.js";
import { resendVerificationEmail } from "./auth.service.js";
import { resendVerificationRateLimit } from "./auth.rate-limit.js";
import { loginSchema } from "./auth.schemas.js";
import { authenticateUser } from "./auth.service.js";
import { loginRateLimit } from "./auth.rate-limit.js";
import { requireAuth } from "./auth.middleware.js";
import { forgotPasswordSchema } from "./auth.schemas.js";
import { forgotPasswordRateLimit } from "./auth.rate-limit.js";
import { requestPasswordReset } from "./auth.service.js";
import { resetPasswordSchema } from "./auth.schemas.js";
import { resetPasswordRateLimit } from "./auth.rate-limit.js";
import { resetUserPassword } from "./auth.service.js";
import { csrfTokenHandler } from "../../middleware/csrf.middleware.js";
import { csrfProtection } from "../../middleware/csrf.middleware.js";

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please check your registration details.",
          details: parsed.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
      });
      return;
    }

    const result = await registerUser(parsed.data);

    await sendVerificationEmail({
      email: result.user.email,
      name: result.user.name,
      token: result.verificationToken,
    });

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        message:
          "Account created. Check your email to verify your account.",
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/verify-email", async (req, res, next) => {
  try {
    const parsed = verifyEmailSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please provide a valid verification token.",
        },
      });
      return;
    }

    await verifyUserEmail(parsed.data);

    res.status(200).json({
      success: true,
      data: {
        message: "Email verified successfully. You can now log in.",
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_OR_EXPIRED_VERIFICATION_TOKEN"
    ) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_OR_EXPIRED_TOKEN",
          message: "This verification link is invalid or has expired.",
        },
      });
      return;
    }

    if (
      error instanceof Error &&
      error.message === "EMAIL_ALREADY_VERIFIED"
    ) {
      res.status(409).json({
        success: false,
        error: {
          code: "EMAIL_ALREADY_VERIFIED",
          message: "This email address has already been verified.",
        },
      });
      return;
    }

    next(error);
  }
});

authRouter.post("/resend-verification", 
    resendVerificationRateLimit,
    async (req, res, next) => {
  try {
    const parsed = resendVerificationSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please provide a valid email address.",
        },
      });
      return;
    }

    await resendVerificationEmail(parsed.data);

    res.status(200).json({
      success: true,
      data: {
        message:
          "If the account exists and needs verification, a verification email will be sent.",
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", loginRateLimit, async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please provide a valid email address and password.",
        },
      });
      return;
    }

    const user = await authenticateUser(parsed.data);

    // Regenerate the session to help prevent session fixation.
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    req.session.userId = user.id;
    req.session.sessionVersion = user.sessionVersion;

    // Ensure the session is stored before reporting login success.
    await new Promise<void>((resolve, reject) => {
      req.session.save((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    res.status(200).json({
  success: true,
  data: {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    message: "Logged in successfully.",
  },
});
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_CREDENTIALS"
    ) {
      res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid credentials or email not verified.",
        },
      });
      return;
    }

    next(error);
  }
});

authRouter.get("/me", requireAuth, (req, res) => {
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

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    },
  });
});

authRouter.post("/logout", csrfProtection, (req, res, next) => {
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

    res.status(200).json({
      success: true,
      data: {
        message: "Logged out successfully.",
      },
    });
  });
});

authRouter.post( "/forgot-password",
  forgotPasswordRateLimit,
  async (req, res, next) => {
    try {
      const parsed = forgotPasswordSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Please provide a valid email address.",
        });
        return;
      }

      await requestPasswordReset(parsed.data);

      res.status(200).json({
        message:
          "If an account with that email exists, password reset instructions have been sent.",
      });
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post( "/reset-password",
  resetPasswordRateLimit,
  async (req, res, next) => {
    try {
      const parsed = resetPasswordSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Please provide a valid token and password.",
        });
        return;
      }

      await resetUserPassword(parsed.data);

      res.status(200).json({
        message:
          "Your password has been reset successfully. Please log in again.",
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "INVALID_OR_EXPIRED_RESET_TOKEN"
      ) {
        res.status(400).json({
          error: "INVALID_OR_EXPIRED_RESET_TOKEN",
          message:
            "This password reset link is invalid, expired, or has already been used.",
        });
        return;
      }

      next(error);
    }
  },
);

authRouter.get("/csrf-token", csrfTokenHandler);