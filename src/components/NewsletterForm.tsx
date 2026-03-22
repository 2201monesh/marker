import { useState, useRef, useEffect, useCallback } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitHubSpotForm, HUBSPOT_FORMS } from "@/lib/hubspot";
import { drawHighlightStroke } from "@/lib/marker-background.js";

const emailSchema = z.string().email("Please enter a valid email address");

const COLORS = ['#e8dcc8', '#dfd3bc', '#ede2d0'];
const STROKES = [
  { yPct: 0.38, angle:  0.8, thickPct: 0.38, direction: 1 as const },   // left → right
  { yPct: 0.62, angle: -0.6, thickPct: 0.36, direction: -1 as const },  // right → left
];

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimatedRef = useRef(false);

  function getStrokeLayout(section: HTMLElement, W: number, H: number) {
    const content = section.querySelector('.max-w-lg') as HTMLElement;
    const sectionRect = section.getBoundingClientRect();
    let contentLeft = 0;
    let contentRight = W;
    if (content) {
      const contentRect = content.getBoundingClientRect();
      contentLeft = contentRect.left - sectionRect.left;
      contentRight = contentRect.right - sectionRect.left;
    }
    const overshoot = (contentRight - contentLeft) * 0.08;

    return STROKES.map((s, i) => {
      const cy = H * s.yPct;
      const angleRad = s.angle * (Math.PI / 180);
      const sx = contentLeft - overshoot;
      const ex = contentRight + overshoot;
      const strokeLen = ex - sx;
      const rise = Math.sin(angleRad) * strokeLen * 0.5;
      return {
        sx, sy: cy - rise, ex, ey: cy + rise,
        color: COLORS[i % COLORS.length],
        thickness: H * s.thickPct,
        opacity: 0.17,
        direction: s.direction,
      };
    });
  }

  // Instant render (resize / reduced motion)
  const renderFull = useCallback(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const dpr = window.devicePixelRatio || 1;
    const W = section.clientWidth;
    const H = section.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    getStrokeLayout(section, W, H).forEach(p => drawHighlightStroke(ctx, p));
  }, []);

  // Animated draw-in triggered by IntersectionObserver
  const renderAnimated = useCallback(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const dpr = window.devicePixelRatio || 1;
    const W = section.clientWidth;
    const H = section.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const params = getStrokeLayout(section, W, H);

    // Each stroke on its own offscreen canvas
    const offscreens = params.map(p => {
      const off = document.createElement('canvas');
      off.width = canvas.width;
      off.height = canvas.height;
      const octx = off.getContext('2d')!;
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawHighlightStroke(octx, p);
      return off;
    });

    const DURATION = 850;
    const STAGGER = 120;
    const startTime = performance.now();

    function ease(t: number) {
      return t < 0.15 ? t * t / 0.15 : 1 - Math.pow(1 - t, 2.5);
    }

    function animate(now: number) {
      ctx.clearRect(0, 0, W, H);
      let allDone = true;

      params.forEach((p, i) => {
        const elapsed = now - startTime - i * STAGGER;
        if (elapsed <= 0) { allDone = false; return; }
        const t = Math.min(1, elapsed / DURATION);
        if (t < 1) allDone = false;
        const eased = ease(t);

        const strokeWidth = p.ex - p.sx;
        const revealWidth = strokeWidth * eased;
        if (revealWidth <= 0) return;

        ctx.save();
        ctx.beginPath();
        if (p.direction === 1) {
          // Left to right
          ctx.rect(p.sx - 2, 0, revealWidth + 4, H);
        } else {
          // Right to left
          ctx.rect(p.ex - revealWidth - 2, 0, revealWidth + 4, H);
        }
        ctx.clip();
        ctx.drawImage(offscreens[i], 0, 0, offscreens[i].width, offscreens[i].height, 0, 0, W, H);
        ctx.restore();
      });

      if (!allDone) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      renderFull();
    } else {
      // Trigger animation when section scrolls into view
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasAnimatedRef.current) {
              hasAnimatedRef.current = true;
              renderAnimated();
              observer.unobserve(section);
            }
          });
        },
        { threshold: 0.2 }
      );
      observer.observe(section);

      return () => observer.disconnect();
    }
  }, [renderFull, renderAnimated]);

  useEffect(() => {
    // On resize, just re-render fully (no re-animation)
    const onResize = () => { if (hasAnimatedRef.current) renderFull(); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [renderFull]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setStatus("loading");
    setError("");

    const response = await submitHubSpotForm(HUBSPOT_FORMS.newsletter, [
      { objectTypeId: "0-1", name: "email", value: email },
    ]);

    if (response.success) {
      setStatus("success");
      if (window.amplitude) {
        window.amplitude.setUserId(email);
        window.amplitude.track("Newsletter Subscribed");
      }
    } else {
      setStatus("error");
      setError(response.error || "Something went wrong.");
    }
  }

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-8">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground leading-[1.15] md:text-4xl">
            Stay in the loop
          </h2>
          <p className="mt-4 text-muted-foreground">
            Get product updates, early access announcements, and supply chain
            insights delivered to your inbox.
          </p>

          {status === "success" ? (
            <p className="mt-8 text-primary font-medium">
              You're on the list. We'll be in touch!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex gap-3">
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={status === "loading"}
                variant="molding-flip"
                size="default"
              >
                {status === "loading" ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </section>
  );
}
