"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

export function ContactInquiryForm() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        window.alert("Thank you! Your dispatch has been submitted to the Yuvaan student desk.");
      }}
      className="mt-6 flex flex-col gap-4 text-xs font-bold"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[var(--color-text-dark)] mb-1 uppercase tracking-wide">
            Your Full Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Alex Sharma"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-cream-canvas)] border-2 border-[var(--color-border-dark)] comic-shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ember)]"
          />
        </div>
        <div>
          <label className="block text-[var(--color-text-dark)] mb-1 uppercase tracking-wide">
            Email Address
          </label>
          <input
            type="email"
            required
            placeholder="e.g. alex@university.edu"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-cream-canvas)] border-2 border-[var(--color-border-dark)] comic-shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ember)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[var(--color-text-dark)] mb-1 uppercase tracking-wide">
            College / Organization
          </label>
          <input
            type="text"
            placeholder="e.g. IIT Guwahati, NIT Silchar..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-cream-canvas)] border-2 border-[var(--color-border-dark)] comic-shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ember)]"
          />
        </div>
        <div>
          <label className="block text-[var(--color-text-dark)] mb-1 uppercase tracking-wide">
            Inquiry Topic
          </label>
          <select className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-cream-canvas)] border-2 border-[var(--color-border-dark)] comic-shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ember)]">
            <option>Event Participation &amp; Registration</option>
            <option>Corporate Sponsorship &amp; Stalls</option>
            <option>Campus Accommodation &amp; Travel</option>
            <option>Media &amp; Press Credentials</option>
            <option>Technical Platform Inquiry</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[var(--color-text-dark)] mb-1 uppercase tracking-wide">
          Message Dispatch
        </label>
        <textarea
          rows={4}
          required
          placeholder="Write your question or request here..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-cream-canvas)] border-2 border-[var(--color-border-dark)] comic-shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ember)]"
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full justify-center text-sm font-black"
        >
          Dispatch Inquiry to Student Desk &rarr;
        </Button>
      </div>
    </form>
  );
}
