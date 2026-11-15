import { useCallback, useEffect, useState } from "react";

export function useLightbox<T>(items: T[]) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const next = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null || !items.length) return current;
      return (current + 1) % items.length;
    });
  }, [items.length]);
  const previous = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null || !items.length) return current;
      return (current - 1 + items.length) % items.length;
    });
  }, [items.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") previous();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, close, next, previous]);

  const activeItem = activeIndex !== null ? items[activeIndex] : null;
  return { activeIndex, activeItem, setActiveIndex, close, next, previous };
}