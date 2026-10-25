import argon2 from "argon2";
import { createHash, randomBytes } from "node:crypto";

import { prisma } from "../../lib/prisma.js";
import type { RegisterInput } from "./auth.schemas.js";
import type { VerifyEmailInput } from "./auth.schemas.js";
import type { ResendVerificationInput } from "./auth.schemas.js";
import { sendVerificationEmail } from "../../lib/email.js";
import type { LoginInput } from "./auth.schemas.js";
import { sendPasswordResetEmail } from "../../lib/email.js";
import type { ForgotPasswordInput } from "./auth.schemas.js"
import type { ResetPasswordInput } from "./auth.schemas.js";
import type { Prisma } from "../../generated/client.js";

async function assignFactionIfAvailable(
  tx: Prisma.TransactionClient,
  userId: string,
): Promise<void> {
  // Only one faction-assignment decision can run at a time.
  // This lock is shared across application instances using PostgreSQL.
  await tx.$queryRaw`
    SELECT pg_advisory_xact_lock(735219841)
  `;

  // Membership is permanent. Never assign someone again if they
  // already have a membership record, even if it is inactive.
  const existingMembership = await tx.factionMembership.findFirst({
    where: { userId },
    select: { id: true },
  });

  if (existingMembership) return;

  // Only active factions are eligible for new assignments.
  const factions = await tx.faction.findMany({
    where: { isActive: true },
    select: { id: true },
    orderBy: { id: "asc" },
  });

  // No active factions? Keep the user verified but unassigned.
  // A later login can retry the assignment.
  if (factions.length === 0) return;

  // Count active memberships belonging to verified users.
  const counts = await Promise.all(
    factions.map(async (faction) => ({
      factionId: faction.id,
      count: await tx.factionMembership.count({
        where: {
          factionId: faction.id,
          isActive: true,
          user: {
            emailVerifiedAt: { not: null },
          },
        },
      }),
    })),
  );

  const lowestCount = Math.min(...counts.map((item) => item.count));
const candidates = counts.filter((item) => item.count === lowestCount);

if (candidates.length === 0) return;

const selected = candidates[Math.floor(Math.random() * candidates.length)];

if (!selected) return;

await tx.factionMembership.create({
  data: { userId, factionId: selected.factionId },
});

}

export async function registerUser(input: RegisterInput) {
  const passwordHash = await argon2.hash(input.password, {
    type: argon2.argon2id,
  });

  // Generate a high-entropy, single-use verification token.
  const rawToken = randomBytes(32).toString("base64url");

  const tokenHash = createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerifiedAt: true,
        role: true,
        createdAt: true,
      },
    });

    await tx.emailVerificationToken.create({
      data: {
        userId: createdUser.id,
        tokenHash,
        expiresAt,
      },
    });

    return createdUser;
  });

  return {
    user,
    verificationToken: rawToken,
    verificationExpiresAt: expiresAt,
  };
}

export async function verifyUserEmail(input: VerifyEmailInput) {
  const tokenHash = createHash("sha256")
    .update(input.token)
    .digest("hex");

  return prisma.$transaction(async (tx) => {
    const token = await tx.emailVerificationToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        consumedAt: true,
        user: {
          select: {
            emailVerifiedAt: true,
          },
        },
      },
    });

    if (!token || token.consumedAt || token.expiresAt <= new Date()) {
      throw new Error("INVALID_OR_EXPIRED_VERIFICATION_TOKEN");
    }

    if (token.user.emailVerifiedAt) {
      throw new Error("EMAIL_ALREADY_VERIFIED");
    }

    // Claim the token atomically so concurrent requests cannot reuse it.
    const claimedToken = await tx.emailVerificationToken.updateMany({
      where: {
        id: token.id,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: {
        consumedAt: new Date(),
      },
    });

    if (claimedToken.count !== 1) {
      throw new Error("INVALID_OR_EXPIRED_VERIFICATION_TOKEN");
    }

    await tx.user.update({
  where: { id: token.userId },
  data: { emailVerifiedAt: new Date() },
});

// Assign a faction in the same transaction as verification.
// If there are no active factions, verification still succeeds.
await assignFactionIfAvailable(tx, token.userId);

return { verified: true };
  });
}

export async function resendVerificationEmail(
  input: ResendVerificationInput,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerifiedAt: true,
    },
  });

  // Return the same outcome for unknown and already-verified accounts.
  if (!user || user.emailVerifiedAt) {
    return;
  }

  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  // Replace outstanding tokens with a fresh token.
  await prisma.$transaction(async (tx) => {
    await tx.emailVerificationToken.updateMany({
      where: {
        userId: user.id,
        consumedAt: null,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    await tx.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });
  });

  try {
    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      token: rawToken,
    });
  } catch (error) {
    // Invalidate the newly created token if email delivery fails.
    await prisma.emailVerificationToken.updateMany({
      where: {
        tokenHash,
        consumedAt: null,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    throw error;
  }
}

export async function authenticateUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      emailVerifiedAt: true,
      role: true,
      sessionVersion: true,
    },
  });

  // Use one generic error for accounts that cannot log in.
  if (
    !user ||
    !user.passwordHash ||
    !user.emailVerifiedAt
  ) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordMatches = await argon2.verify(
    user.passwordHash,
    input.password,
  );

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // Repair an unassigned verified account when a faction is available.
await prisma.$transaction(async (tx) => {
  const currentUser = await tx.user.findUnique({
    where: { id: user.id },
    select: { emailVerifiedAt: true },
  });

  if (currentUser?.emailVerifiedAt) {
    await assignFactionIfAvailable(tx, user.id);
  }
});

  // Never return the password hash to the route or frontend.
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    sessionVersion: user.sessionVersion,
  };
}

export async function requestPasswordReset(
  input: ForgotPasswordInput,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      emailVerifiedAt: true,
    },
  });

  // Always let the route return the same response.
  // Google-only accounts do not have a password to reset.
  if (
    !user ||
    !user.emailVerifiedAt ||
    !user.passwordHash
  ) {
    return;
  }

  const rawToken = randomBytes(32).toString("base64url");

  const tokenHash = createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    // Invalidate any earlier, outstanding reset links.
    await tx.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        consumedAt: null,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    await tx.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });
  });

  try {
    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      token: rawToken,
    });
  } catch {
    // A failed delivery must not leave a usable reset token.
    await prisma.passwordResetToken.updateMany({
      where: {
        tokenHash,
        consumedAt: null,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    throw new Error("PASSWORD_RESET_EMAIL_FAILED");
  }
}

export async function resetUserPassword(
  input: ResetPasswordInput,
): Promise<void> {
  const tokenHash = createHash("sha256")
    .update(input.token)
    .digest("hex");

  const passwordHash = await argon2.hash(input.password, {
    type: argon2.argon2id,
  });

  await prisma.$transaction(async (tx) => {
    const resetToken = await tx.passwordResetToken.findUnique({
      where: {
        tokenHash,
      },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        consumedAt: true,
      },
    });

    if (
      !resetToken ||
      resetToken.consumedAt !== null ||
      resetToken.expiresAt <= new Date()
    ) {
      throw new Error("INVALID_OR_EXPIRED_RESET_TOKEN");
    }

    // Conditional update prevents a token from being consumed twice.
    const consumed = await tx.passwordResetToken.updateMany({
      where: {
        id: resetToken.id,
        consumedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        consumedAt: new Date(),
      },
    });

    if (consumed.count !== 1) {
      throw new Error("INVALID_OR_EXPIRED_RESET_TOKEN");
    }

    await tx.user.update({
      where: {
        id: resetToken.userId,
      },
      data: {
        passwordHash,
        sessionVersion: {
          increment: 1,
        },
      },
    });

    // Invalidate any other outstanding password-reset links.
    await tx.passwordResetToken.updateMany({
      where: {
        userId: resetToken.userId,
        id: {
          not: resetToken.id,
        },
        consumedAt: null,
      },
      data: {
        consumedAt: new Date(),
      },
    });
  });
}