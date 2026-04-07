import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * ── HIGH MIRROR — Scroll-Animated Shoe Showcase ──
 *
 * Place your shoe brand image at: public/shoe-hero.png
 * (transparent PNG works best for the floating effect)
 *
 * The image will:
 *   - Stay pinned as you scroll through 4 text panels
 *   - Scale up/down, rotate, and float — all tied to scroll (scrub)
 *   - Reverse everything when scrolling back up
 */

// ── Place your shoe image in public/ and update this path ──
const SHOE_IMAGE = "/mockup.png";

const showcaseSteps = [
  {
    title: "Engineered Precision",
    description:
      "Every gear turns with purpose. Mechanical precision meets artisan craftsmanship in a shoe built for perfection.",
    accent: "Clockwork Mastery",
  },
  {
    title: "Wings of Freedom",
    description:
      "Inspired by flight. Ultra-light construction with sculpted wing details that let you move without limits.",
    accent: "Angelic Design",
  },
  {
    title: "Marble Finish",
    description:
      "Premium white leather with hand-marbled veins of gold. Each pair is unique — a wearable work of art.",
    accent: "Luxury Materials",
  },
  {
    title: "Mirror Reflection",
    description:
      "See yourself elevated. The High Mirror signature — where streetwear meets haute couture.",
    accent: "High Mirror Signature",
  },
];

export function ScrollSplineShoe() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const shoeRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const shoe = shoeRef.current;
    const glow = glowRef.current;
    const panels = panelsRef.current;
    if (!section || !shoe || !glow || !panels) return;

    const panelEls = panels.querySelectorAll<HTMLElement>(".showcase-panel");
    const gearEls = section.querySelectorAll<HTMLElement>(".gear-icon");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
        onUpdate: (self) => {
          // Update progress dots
          const bars = section.querySelectorAll<HTMLElement>("[data-progress-bar]");
          bars.forEach((bar, i) => {
            const segmentProgress =
              (self.progress - i / showcaseSteps.length) * showcaseSteps.length;
            const pct = Math.max(0, Math.min(1, segmentProgress)) * 100;
            bar.style.width = `${pct}%`;
          });
        },
      },
    });

    // ── Shoe image: scale up, rotate, float ──
    // Phase 1: Enter — fade in + scale up + slight rotate
    tl.fromTo(
      shoe,
      { scale: 0.7, opacity: 0, rotation: -8, y: 60 },
      { scale: 1, opacity: 1, rotation: 0, y: 0, duration: 0.2, ease: "power3.out" },
      0
    );
    // Phase 2: Mid — float up + scale larger + gentle tilt
    tl.to(
      shoe,
      { scale: 1.15, y: -30, rotation: 5, duration: 0.3, ease: "power1.inOut" },
      0.2
    );
    // Phase 3: Continue — rotate other way + keep floating
    tl.to(
      shoe,
      { scale: 1.08, y: -15, rotation: -3, duration: 0.25, ease: "sine.inOut" },
      0.5
    );
    // Phase 4: Settle back
    tl.to(
      shoe,
      { scale: 1, y: 0, rotation: 0, duration: 0.25, ease: "power2.inOut" },
      0.75
    );

    // ── Background glow — pulses with the shoe ──
    tl.fromTo(
      glow,
      { opacity: 0, scale: 0.5 },
      { opacity: 0.6, scale: 1, duration: 0.25, ease: "power2.out" },
      0
    );
    tl.to(glow, { opacity: 0.9, scale: 1.2, duration: 0.3, ease: "sine.inOut" }, 0.25);
    tl.to(glow, { opacity: 0.4, scale: 1.1, duration: 0.2, ease: "sine.inOut" }, 0.55);
    tl.to(glow, { opacity: 0, scale: 0.8, duration: 0.25, ease: "power2.in" }, 0.75);

    // ── Gears rotate with scroll ──
    gearEls.forEach((gear, i) => {
      const dir = i % 2 === 0 ? 360 : -360;
      tl.fromTo(
        gear,
        { rotation: 0, opacity: 0 },
        { rotation: dir, opacity: 0.2, duration: 1, ease: "none" },
        0
      );
    });

    // ── Text panels: blur-in → hold → blur-out ──
    panelEls.forEach((panel, i) => {
      const start = i / panelEls.length;
      const fadeIn = 0.05;
      const hold = 1 / panelEls.length - fadeIn * 2;

      tl.fromTo(
        panel,
        { opacity: 0, y: 60, filter: "blur(10px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: fadeIn, ease: "power2.out" },
        start
      );
      tl.to(
        panel,
        { opacity: 0, y: -40, filter: "blur(6px)", duration: fadeIn, ease: "power2.in" },
        start + fadeIn + hold
      );
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative shoe-section-height"
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Marble-inspired background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f5f0eb] via-[#eae4dd] to-[#f0ece7] dark:from-[#0a0908] dark:via-[#111010] dark:to-[#0d0c0b]" />
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] marble-bg" />

        {/* Soft radial glow behind shoe */}
        <div
          ref={glowRef}
          className="absolute top-1/2 left-[60%] lg:left-[62%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[550px] md:h-[550px] rounded-full pointer-events-none opacity-0 shoe-glow"
        />

        {/* Decorative gears */}
        <svg className="gear-icon absolute top-[15%] left-[10%] w-12 h-12 md:w-16 md:h-16 text-foreground/10 pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm7.94-5.46-.92-.38a6.04 6.04 0 0 0 0-2.32l.92-.38a.75.75 0 0 0 .38-1.01l-1-1.73a.75.75 0 0 0-1.01-.27l-.85.49a6.02 6.02 0 0 0-2.01-1.16V4.25a.75.75 0 0 0-.75-.75h-2a.75.75 0 0 0-.75.75v.73a6.02 6.02 0 0 0-2.01 1.16l-.85-.49a.75.75 0 0 0-1.01.27l-1 1.73a.75.75 0 0 0 .38 1.01l.92.38a6.04 6.04 0 0 0 0 2.32l-.92.38a.75.75 0 0 0-.38 1.01l1 1.73a.75.75 0 0 0 1.01.27l.85-.49a6.02 6.02 0 0 0 2.01 1.16v.73a.75.75 0 0 0 .75.75h2a.75.75 0 0 0 .75-.75v-.73a6.02 6.02 0 0 0 2.01-1.16l.85.49a.75.75 0 0 0 1.01-.27l1-1.73a.75.75 0 0 0-.38-1.01Z" />
        </svg>
        <svg className="gear-icon absolute bottom-[18%] right-[8%] w-10 h-10 md:w-14 md:h-14 text-foreground/10 pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm7.94-5.46-.92-.38a6.04 6.04 0 0 0 0-2.32l.92-.38a.75.75 0 0 0 .38-1.01l-1-1.73a.75.75 0 0 0-1.01-.27l-.85.49a6.02 6.02 0 0 0-2.01-1.16V4.25a.75.75 0 0 0-.75-.75h-2a.75.75 0 0 0-.75.75v.73a6.02 6.02 0 0 0-2.01 1.16l-.85-.49a.75.75 0 0 0-1.01.27l-1 1.73a.75.75 0 0 0 .38 1.01l.92.38a6.04 6.04 0 0 0 0 2.32l-.92.38a.75.75 0 0 0-.38 1.01l1 1.73a.75.75 0 0 0 1.01.27l.85-.49a6.02 6.02 0 0 0 2.01 1.16v.73a.75.75 0 0 0 .75.75h2a.75.75 0 0 0 .75-.75v-.73a6.02 6.02 0 0 0 2.01-1.16l.85.49a.75.75 0 0 0 1.01-.27l1-1.73a.75.75 0 0 0-.38-1.01Z" />
        </svg>
        <svg className="gear-icon absolute top-[60%] left-[6%] w-8 h-8 md:w-10 md:h-10 text-foreground/10 pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm7.94-5.46-.92-.38a6.04 6.04 0 0 0 0-2.32l.92-.38a.75.75 0 0 0 .38-1.01l-1-1.73a.75.75 0 0 0-1.01-.27l-.85.49a6.02 6.02 0 0 0-2.01-1.16V4.25a.75.75 0 0 0-.75-.75h-2a.75.75 0 0 0-.75.75v.73a6.02 6.02 0 0 0-2.01 1.16l-.85-.49a.75.75 0 0 0-1.01.27l-1 1.73a.75.75 0 0 0 .38 1.01l.92.38a6.04 6.04 0 0 0 0 2.32l-.92.38a.75.75 0 0 0-.38 1.01l1 1.73a.75.75 0 0 0 1.01.27l.85-.49a6.02 6.02 0 0 0 2.01 1.16v.73a.75.75 0 0 0 .75.75h2a.75.75 0 0 0 .75-.75v-.73a6.02 6.02 0 0 0 2.01-1.16l.85.49a.75.75 0 0 0 1.01-.27l1-1.73a.75.75 0 0 0-.38-1.01Z" />
        </svg>
        <svg className="gear-icon absolute top-[22%] right-[12%] w-6 h-6 md:w-9 md:h-9 text-foreground/10 pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm7.94-5.46-.92-.38a6.04 6.04 0 0 0 0-2.32l.92-.38a.75.75 0 0 0 .38-1.01l-1-1.73a.75.75 0 0 0-1.01-.27l-.85.49a6.02 6.02 0 0 0-2.01-1.16V4.25a.75.75 0 0 0-.75-.75h-2a.75.75 0 0 0-.75.75v.73a6.02 6.02 0 0 0-2.01 1.16l-.85-.49a.75.75 0 0 0-1.01.27l-1 1.73a.75.75 0 0 0 .38 1.01l.92.38a6.04 6.04 0 0 0 0 2.32l-.92.38a.75.75 0 0 0-.38 1.01l1 1.73a.75.75 0 0 0 1.01.27l.85-.49a6.02 6.02 0 0 0 2.01 1.16v.73a.75.75 0 0 0 .75.75h2a.75.75 0 0 0 .75-.75v-.73a6.02 6.02 0 0 0 2.01-1.16l.85.49a.75.75 0 0 0 1.01-.27l1-1.73a.75.75 0 0 0-.38-1.01Z" />
        </svg>

        {/* Main content */}
        <div className="container relative z-10 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 h-full">
          {/* Text panels */}
          <div
            ref={panelsRef}
            className="relative w-full lg:w-2/5 h-[220px] md:h-[260px] flex items-center"
          >
            {showcaseSteps.map((step, i) => (
              <div
                key={i}
                className="showcase-panel absolute inset-0 flex flex-col justify-center opacity-0"
              >
                <span className="text-xs font-semibold tracking-[0.25em] uppercase mb-4 text-primary">
                  {step.accent}
                </span>
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
                  {step.title}
                </h2>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-md">
                  {step.description}
                </p>
                <div className="mt-6 w-16 h-[2px] bg-gradient-to-r from-primary to-primary/0 rounded-full" />
              </div>
            ))}
          </div>

          {/* Shoe image — scroll-animated */}
          <div className="relative w-full lg:w-3/5 h-[350px] md:h-[450px] lg:h-[550px] flex items-center justify-center">
            <img
              ref={shoeRef}
              src={SHOE_IMAGE}
              alt="High Mirror Signature Shoe"
              className="w-full h-full object-contain drop-shadow-2xl select-none pointer-events-none opacity-0"
              draggable={false}
            />

            {/* "HIGH MIRROR" watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none -z-10">
              <span className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-foreground/[0.03] tracking-[0.15em] whitespace-nowrap">
                HIGH MIRROR
              </span>
            </div>
          </div>
        </div>

        {/* Bottom progress bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {showcaseSteps.map((_, i) => (
            <div
              key={i}
              className="w-10 h-[2px] bg-foreground/10 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-primary rounded-full transition-[width] duration-100 ease-linear"
                style={{ width: "0%" }}
                data-progress-bar={i}
              />
            </div>
          ))}
          <span className="text-[10px] text-muted-foreground ml-2 tracking-[0.2em] uppercase">
            Scroll
          </span>
        </div>
      </div>
    </section>
  );
}
