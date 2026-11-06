import { useEffect, useRef, useState } from "react";

export const useScrollReveal = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold]);

  return { ref, isVisible };
};
