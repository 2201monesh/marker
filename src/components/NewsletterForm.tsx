import { useState, useEffect, useRef, useCallback } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitHubSpotForm, HUBSPOT_FORMS } from "@/lib/hubspot";
import { drawCleanUnderline } from "@/lib/marker-background.js";

const emailSchema = z.string().email("Please enter a valid email address");

const HIGHLIGHT_COLOR = '#3A7D56';

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimatedRef = useRef(false);

  const getStrokeParams = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return [];
    const sectionRect = section.getBoundingClientRect();
    const lines = section.querySelectorAll('[data-marker-line]');
    if (!lines.length) return [];
    const angleRad = -0.3 * (Math.PI / 180);
    return Array.from(lines).map((line) => {
      const rect = line.getBoundingClientRect();
      const thickness = 10;
      const cy = rect.bottom - sectionRect.top + 1;
      const sx = rect.left - sectionRect.left - 5;
      const ex = rect.right - sectionRect.left + 5;
      const strokeLen = ex - sx;
      const rise = Math.sin(angleRad) * strokeLen * 0.5;
      return { sx, sy: cy - rise, ex, ey: cy + rise, color: HIGHLIGHT_COLOR, thickness, opacity: 1 };
    });
  }, []);

  const renderFull = useCallback(() => {
    const canvas = document.getElementById('newsletter-canvas') as HTMLCanvasElement;
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
    getStrokeParams().forEach(p => drawCleanUnderline(ctx, p));
  }, [getStrokeParams]);

  const renderAnimated = useCallback(() => {
    const canvas = document.getElementById('newsletter-canvas') as HTMLCanvasElement;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const dpr = window.devicePixelRatio || 1;
    const W = section.clientWidth;
    const H = section.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const params = getStrokeParams();
    const offscreens = params.map(p => {
      const off = document.createElement('canvas');
      off.width = canvas.width;
      off.height = canvas.height;
      const octx = off.getContext('2d')!;
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawCleanUnderline(octx, p);
      return off;
    });
    const DURATION = 650;
    const STAGGER = 500;
    const startTime = performance.now();
    function ease(t: number) { return t < 0.15 ? t * t / 0.15 : 1 - Math.pow(1 - t, 2.5); }
    function animate(now: number) {
      ctx.clearRect(0, 0, W, H);
      let allDone = true;
      params.forEach((p, i) => {
        const elapsed = now - startTime - i * STAGGER;
        if (elapsed <= 0) { allDone = false; return; }
        const t = Math.min(1, elapsed / DURATION);
        if (t < 1) allDone = false;
        const revealWidth = (p.ex - p.sx) * ease(t);
        if (revealWidth <= 0) return;
        ctx.save();
        ctx.beginPath();
        ctx.rect(p.sx - 2, 0, revealWidth + 4, H);
        ctx.clip();
        ctx.drawImage(offscreens[i], 0, 0, offscreens[i].width, offscreens[i].height, 0, 0, W, H);
        ctx.restore();
      });
      if (!allDone) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [getStrokeParams]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      renderFull();
    } else {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            renderAnimated();
            observer.disconnect();
          }
        },
        { threshold: 0.2 }
      );
      observer.observe(section);
      return () => observer.disconnect();
    }
  }, [renderFull, renderAnimated]);

  useEffect(() => {
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
    <section ref={sectionRef} className="relative py-24 md:py-32 overflow-hidden">
      <canvas
        id="newsletter-canvas"
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-8">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground leading-[1.15] md:text-4xl">
            <span data-marker-line>Stay in the loop</span>
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
              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-molding inline-flex h-11 items-center justify-center px-8 text-sm font-semibold tracking-wide text-primary transition-colors cursor-pointer disabled:opacity-50"
              >
                {status === "loading" ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </section>
  );
}
