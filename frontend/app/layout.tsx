import type { Metadata } from "next";
import { Anton, Roboto_Mono, Permanent_Marker, Bangers, Barlow } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { PointerTrails } from "@/components/effects/PointerTrails";
import { Footer } from "@/components/layout/Footer";

const bangers = Bangers({ weight: "400", subsets: ["latin"], variable: "--font-bangers", display: "swap" });
const barlow = Barlow({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-barlow", display: "swap" });

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const permanentMarker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-marker",
  display: "swap",
});

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
    <html lang="en" className={`h-full antialiased ${anton.variable} ${robotoMono.variable} ${permanentMarker.variable} ${bangers.variable} ${barlow.variable}`}>
      <body className="min-h-full flex flex-col paper-grid">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Navbar />
        <main id="main-content" tabIndex={-1} className="flex-1">{children}</main>
        <Footer />
        <PointerTrails />
      </body>
    </html>
  );
}
