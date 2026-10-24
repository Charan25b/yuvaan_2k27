import "dotenv/config";
import argon2 from "argon2";
import { prisma } from "../lib/prisma.js";

const LOCK_ID = 748219;

function getBootstrapConfig() {
  const name = process.env.SUPERADMIN_NAME?.trim();
  const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!name || name.length < 2 || name.length > 80) {
    throw new Error(
      "SUPERADMIN_NAME must contain between 2 and 80 characters.",
    );
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("SUPERADMIN_EMAIL must be a valid email address.");
  }

  if (!password || password.length < 12 || password.length > 128) {
    throw new Error(
      "SUPERADMIN_PASSWORD must contain between 12 and 128 characters.",
    );
  }

  return { name, email, password };
}

async function main() {
  const { name, email, password } = getBootstrapConfig();

  // Hash before opening the transaction so the database lock is held briefly.
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
  });

  await prisma.$transaction(
    async (tx) => {
      // Serialize concurrent bootstrap attempts.
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(${LOCK_ID}::bigint)
      `;

      const existingSuperadmin = await tx.user.findFirst({
        where: { role: "SUPERADMIN" },
        select: { id: true },
      });

      if (existingSuperadmin) {
        throw new Error(
          "A superadmin already exists. Bootstrap has been refused.",
        );
      }

      const existingUser = await tx.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existingUser) {
        throw new Error(
          "An account with SUPERADMIN_EMAIL already exists. Bootstrap will not change an existing account.",
        );
      }

      await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          emailVerifiedAt: new Date(),
          role: "SUPERADMIN",
        },
      });
    },
    {
      isolationLevel: "Serializable",
    },
  );

  console.info("Initial superadmin created successfully.");
  console.info(`Superadmin email: ${email}`);
}

main()
  .catch((error: unknown) => {
    console.error(
      "Superadmin bootstrap failed:",
      error instanceof Error ? error.message : "Unexpected error.",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });