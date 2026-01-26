import { useState, useEffect, useRef, RefObject } from 'react';

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

interface UseInViewReturn {
  ref: RefObject<HTMLElement>;
  isInView: boolean;
}

export function useInView(options: UseInViewOptions = {}): UseInViewReturn {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) {
            hasTriggered.current = true;
            observer.disconnect();
          }
        } else if (!triggerOnce && !hasTriggered.current) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref: ref as RefObject<HTMLElement>, isInView };
}

// Simpler hook for staggered animations
export function useStaggeredAnimation(
  itemCount: number,
  baseDelay: number = 100
): number[] {
  return Array.from({ length: itemCount }, (_, i) => i * baseDelay);
}
