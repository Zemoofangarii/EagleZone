import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Parallax float effect (hero backgrounds, decorative elements) ──
export function useParallax(speed: number = 0.5) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tween = gsap.to(el, {
      y: () => speed * 100,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [speed]);

  return ref;
}

// ── Reveal on scroll with GSAP (more performant for complex sequences) ──
export function useScrollReveal(options?: {
  y?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { y = 60, duration = 1, delay = 0, stagger = 0.15 } = options || {};

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const children = el.children;
    const targets = children.length > 1 ? children : el;

    gsap.set(targets, { y, opacity: 0 });

    const tween = gsap.to(targets, {
      y: 0,
      opacity: 1,
      duration,
      delay,
      stagger: children.length > 1 ? stagger : 0,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [y, duration, delay, stagger]);

  return ref;
}

// ── Horizontal scroll reveal (feature cards sliding in) ──
export function useSlideIn(direction: "left" | "right" = "left") {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const x = direction === "left" ? -80 : 80;

    gsap.set(el, { x, opacity: 0 });

    const tween = gsap.to(el, {
      x: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [direction]);

  return ref;
}

// ── Premium text reveal (letter-by-letter or line-by-line) ──
export function useTextReveal() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.set(el, { opacity: 0, y: 40, clipPath: "inset(0 0 100% 0)" });

    const tween = gsap.to(el, {
      opacity: 1,
      y: 0,
      clipPath: "inset(0 0 0% 0)",
      duration: 1.2,
      ease: "power4.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return ref;
}

// ── Number counter animation (stats, prices) ──
export function useCountUp(
  endValue: number,
  options?: { duration?: number; prefix?: string; decimals?: number }
) {
  const ref = useRef<HTMLSpanElement>(null);
  const { duration = 2, prefix = "", decimals = 0 } = options || {};

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obj = { value: 0 };

    const tween = gsap.to(obj, {
      value: endValue,
      duration,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        toggleActions: "play none none none",
      },
      onUpdate: () => {
        el.textContent = prefix + obj.value.toFixed(decimals);
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [endValue, duration, prefix, decimals]);

  return ref;
}
