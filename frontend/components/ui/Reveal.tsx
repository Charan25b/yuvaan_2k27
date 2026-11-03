"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";

interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  delay?: number;
  threshold?: number;
}

export function Reveal({ children, delay = 0, className = "", threshold = 0.08, ...props }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || reduced.matches || !("IntersectionObserver" in window)) return;
    // Content stays visible in SSR/no-JS and when reduced motion is requested.
    element.dataset.reveal = "pending";
    const show = () => { delete element.dataset.reveal; };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { show(); observer.disconnect(); }
    }, { threshold, rootMargin: "0px 0px -40px 0px" });
    observer.observe(element);
    reduced.addEventListener("change", show);
    return () => { show(); observer.disconnect(); reduced.removeEventListener("change", show); };
  }, [threshold]);
  return <div ref={ref} className={`section-reveal ${className}`} style={{ transitionDelay: `${delay}ms` }} {...props}>{children}</div>;
}
