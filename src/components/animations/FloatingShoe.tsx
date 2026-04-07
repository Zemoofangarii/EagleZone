import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SHOE_IMAGE = "/mockup.png";

function useFloatingShoe(
  side: "right" | "left",
  containerRef: React.RefObject<HTMLDivElement | null>,
  isHomepage: boolean
) {
  useEffect(() => {
    if (!isHomepage) return;

    const container = containerRef.current;
    if (!container) return;

    const img = container.querySelector("img")!;

    // ── Continuous flying/breathing ──
    const flyTl = gsap.timeline({ repeat: -1, yoyo: true });
    // Offset the left shoe animation so they don't breathe in sync
    const delayOffset = side === "left" ? 0.4 : 0;

    flyTl.to(img, { y: -12, scaleY: 1.02, scaleX: 0.98, duration: 0.8, ease: "sine.inOut", delay: delayOffset });
    flyTl.to(img, { y: 8, scaleY: 0.98, scaleX: 1.02, duration: 0.8, ease: "sine.inOut" });
    flyTl.to(img, { y: -6, scaleY: 1.01, scaleX: 0.99, duration: 0.6, ease: "sine.inOut" });

    // ── Scroll-linked path ──
    const timer = setTimeout(() => {
      const vw = window.innerWidth;
      const shoeW = container.offsetWidth;
      const vh = window.innerHeight;
      const maxY = vh * 0.55;

      // Positions for the RIGHT shoe
      const rRight = 0;
      const rCenterRight = -(vw * 0.15);
      const rCenter = -(vw / 2 - shoeW / 2 - vw * 0.03);
      const rCenterLeft = -(vw * 0.55);
      const rLeft = -(vw * 0.65);

      // Positions for the LEFT shoe (mirrored — positive X = moving right from left edge)
      const lLeft = 0;
      const lCenterLeft = vw * 0.15;
      const lCenter = vw / 2 - shoeW / 2 - vw * 0.03;
      const lCenterRight = vw * 0.55;
      const lRight = vw * 0.65;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 2.5,
        },
      });

      if (side === "right") {
        // Right shoe: starts right, goes left, comes back
        tl.to(container, { x: rCenterRight, y: maxY * 0.1, rotation: -3, scale: 1.05, duration: 0.1, ease: "sine.inOut" }, 0);
        tl.to(container, { x: rCenter, y: maxY * 0.2, rotation: 4, scale: 1.1, duration: 0.1, ease: "sine.inOut" }, 0.1);
        tl.to(container, { x: rCenterLeft, y: maxY * 0.3, rotation: -5, scale: 1.12, duration: 0.1, ease: "sine.inOut" }, 0.2);
        tl.to(container, { x: rLeft, y: maxY * 0.4, rotation: 6, scale: 1.08, duration: 0.1, ease: "sine.inOut" }, 0.3);
        tl.to(container, { x: rCenterLeft, y: maxY * 0.5, rotation: -4, scale: 1.15, duration: 0.1, ease: "sine.inOut" }, 0.4);
        tl.to(container, { x: rCenter, y: maxY * 0.55, rotation: 5, scale: 1.1, duration: 0.1, ease: "sine.inOut" }, 0.5);
        tl.to(container, { x: rCenterRight, y: maxY * 0.5, rotation: -6, scale: 1.12, duration: 0.1, ease: "sine.inOut" }, 0.6);
        tl.to(container, { x: rRight, y: maxY * 0.4, rotation: 4, scale: 1.08, duration: 0.1, ease: "sine.inOut" }, 0.7);
        tl.to(container, { x: rCenterRight, y: maxY * 0.25, rotation: -3, scale: 1.05, duration: 0.1, ease: "sine.inOut" }, 0.8);
        tl.to(container, { x: rRight, y: 0, rotation: 0, scale: 1, duration: 0.1, ease: "sine.inOut" }, 0.9);
      } else {
        // Left shoe: REVERSE — starts left, goes right, comes back
        tl.to(container, { x: lCenterLeft, y: maxY * 0.1, rotation: 3, scale: 1.05, duration: 0.1, ease: "sine.inOut" }, 0);
        tl.to(container, { x: lCenter, y: maxY * 0.2, rotation: -4, scale: 1.1, duration: 0.1, ease: "sine.inOut" }, 0.1);
        tl.to(container, { x: lCenterRight, y: maxY * 0.3, rotation: 5, scale: 1.12, duration: 0.1, ease: "sine.inOut" }, 0.2);
        tl.to(container, { x: lRight, y: maxY * 0.4, rotation: -6, scale: 1.08, duration: 0.1, ease: "sine.inOut" }, 0.3);
        tl.to(container, { x: lCenterRight, y: maxY * 0.5, rotation: 4, scale: 1.15, duration: 0.1, ease: "sine.inOut" }, 0.4);
        tl.to(container, { x: lCenter, y: maxY * 0.55, rotation: -5, scale: 1.1, duration: 0.1, ease: "sine.inOut" }, 0.5);
        tl.to(container, { x: lCenterLeft, y: maxY * 0.5, rotation: 6, scale: 1.12, duration: 0.1, ease: "sine.inOut" }, 0.6);
        tl.to(container, { x: lLeft, y: maxY * 0.4, rotation: -4, scale: 1.08, duration: 0.1, ease: "sine.inOut" }, 0.7);
        tl.to(container, { x: lCenterLeft, y: maxY * 0.25, rotation: 3, scale: 1.05, duration: 0.1, ease: "sine.inOut" }, 0.8);
        tl.to(container, { x: lLeft, y: 0, rotation: 0, scale: 1, duration: 0.1, ease: "sine.inOut" }, 0.9);
      }

      const st = tl.scrollTrigger;
      return () => {
        st?.kill();
        tl.kill();
      };
    }, 200);

    return () => {
      clearTimeout(timer);
      flyTl.kill();
    };
  }, [isHomepage, side, containerRef]);
}

export function FloatingShoe() {
  const rightRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isHomepage = location.pathname === "/";

  useFloatingShoe("right", rightRef, isHomepage);
  useFloatingShoe("left", leftRef, isHomepage);

  if (!isHomepage) return null;

  return (
    <>
      {/* Right shoe */}
      <div
        ref={rightRef}
        className="fixed top-[20%] right-[3%] z-40 pointer-events-none select-none w-[200px] h-[200px] md:w-[280px] md:h-[280px] lg:w-[350px] lg:h-[350px]"
      >
        <img
          src={SHOE_IMAGE}
          alt="High Mirror Shoe"
          className="w-full h-full object-contain drop-shadow-2xl"
          draggable={false}
        />
      </div>

      {/* Left shoe (mirrored) */}
      <div
        ref={leftRef}
        className="fixed top-[20%] left-[3%] z-40 pointer-events-none select-none w-[200px] h-[200px] md:w-[280px] md:h-[280px] lg:w-[350px] lg:h-[350px] -scale-x-100"
      >
        <img
          src={SHOE_IMAGE}
          alt="High Mirror Shoe"
          className="w-full h-full object-contain drop-shadow-2xl"
          draggable={false}
        />
      </div>
    </>
  );
}
