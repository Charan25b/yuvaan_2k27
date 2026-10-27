import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col paper-grid">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
