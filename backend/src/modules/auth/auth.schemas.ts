import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters.")
    .max(80, "Name must not exceed 80 characters."),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(254)
    .transform((email) => email.toLowerCase()),

  password: z
    .string()
    .min(12, "Password must contain at least 12 characters.")
    .max(128, "Password must not exceed 128 characters."),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const verifyEmailSchema = z.object({
  token: z
    .string()
    .min(32, "Invalid verification token.")
    .max(200, "Invalid verification token."),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;