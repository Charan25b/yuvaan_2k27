import type { Metadata } from "next";
import { Anton, Roboto_Mono, Permanent_Marker } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

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
    <html lang="en" className={`h-full antialiased ${anton.variable} ${robotoMono.variable} ${permanentMarker.variable}`}>
      <body className="min-h-full flex flex-col paper-grid">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
