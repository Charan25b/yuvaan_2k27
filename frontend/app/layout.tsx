import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yuvaan 2027 | IIIT Guwahati",
  description:
    "Annual Cultural & Technical Festival of Indian Institute of Information Technology Guwahati.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#0B0E14] text-[var(--color-text-dark)]">
        {children}
      </body>
    </html>
  );
}
