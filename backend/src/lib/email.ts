import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

if (!apiKey) {
  throw new Error("RESEND_API_KEY is not configured.");
}

const resend = new Resend(apiKey);


interface VerificationEmailInput {
  email: string;
  name: string;
  token: string;
}

export async function sendVerificationEmail({
  email,
  name,
  token,
}: VerificationEmailInput): Promise<void> {
  const verificationUrl = new URL(
    "/verify-email",
    process.env.FRONTEND_URL ?? "http://localhost:3000",
  );

  verificationUrl.searchParams.set("token", token);

  const { error } = await resend.emails.send({
  from: emailFrom,
  to: [email],
  subject: "Verify your Yuvaan account",
  html: `
    <h1>Welcome to Yuvaan, ${escapeHtml(name)}!</h1>
    <p>Verify your email address using the link below:</p>
    <p>
      <a href="${escapeHtml(verificationUrl.toString())}">
        Verify email address
      </a>
    </p>
    <p>This link expires in 30 minutes.</p>
  `,
});

if (error) {
  throw new Error(`Failed to send verification email: ${error.message}`);
}
}

export async function sendPasswordResetEmail(input: {
  email: string;
  name: string;
  token: string;
}): Promise<void> {
  const frontendUrl =
    process.env.FRONTEND_URL ?? "http://localhost:3000";

  const resetUrl = new URL(
    "/reset-password",
    frontendUrl,
  );

  resetUrl.searchParams.set("token", input.token);

  const { error } = await resend.emails.send({
    from: emailFrom,
    to: input.email,
    subject: "Reset your Yuvaan password",
    text: [
      `Hi ${input.name},`,
      "",
      "We received a request to reset your Yuvaan account password.",
      "",
      `Reset your password using this link: ${resetUrl.toString()}`,
      "",
      "This link expires in 30 minutes and can only be used once.",
      "If you didn't request this, you can safely ignore this email.",
    ].join("\n"),
    html: `
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>We received a request to reset your Yuvaan account password.</p>
      <p>
        <a href="${escapeHtml(resetUrl.toString())}">
          Reset your password
        </a>
      </p>
      <p>This link expires in 30 minutes and can only be used once.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });

  if (error) {
    throw new Error("PASSWORD_RESET_EMAIL_FAILED");
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character] ?? character;
  });
}
