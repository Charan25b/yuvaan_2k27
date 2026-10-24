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