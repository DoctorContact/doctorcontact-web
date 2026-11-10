"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function LazySection({
  children,
  minHeight = 300,
  rootMargin = "800px",
  loadAfter,
}: {
  children: ReactNode;
  minHeight?: number;
  rootMargin?: string;
  loadAfter?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return undefined;
    const node = ref.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(node);

    const timer =
      typeof loadAfter === "number"
        ? window.setTimeout(() => setVisible(true), loadAfter)
        : undefined;

    return () => {
      observer.disconnect();
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [visible, rootMargin, loadAfter]);

  if (visible) return <>{children}</>;

  return <div ref={ref} style={{ minHeight }} aria-hidden="true" />;
}
