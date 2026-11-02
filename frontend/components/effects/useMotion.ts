"use client";

import { useSyncExternalStore } from "react";

// Shared across the hero and trails; updates only when the OS preference changes.
const query = "(prefers-reduced-motion: reduce)";
const snapshot = () => !window.matchMedia(query).matches;
const serverSnapshot = () => false;
function subscribe(listener: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

export function useMotion() {
  const enabled = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return { enabled };
}
