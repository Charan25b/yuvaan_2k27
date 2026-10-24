import argon2 from "argon2";
import { createHash, randomBytes } from "node:crypto";

import { prisma } from "../../lib/prisma.js";
import type { RegisterInput } from "./auth.schemas.js";
import type { VerifyEmailInput } from "./auth.schemas.js";
import type { ResendVerificationInput } from "./auth.schemas.js";
import { sendVerificationEmail } from "../../lib/email.js";

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