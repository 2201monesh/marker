import { useState, useRef, useEffect, useCallback } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitHubSpotForm, HUBSPOT_FORMS } from "@/lib/hubspot";
import { drawHighlightStroke } from "@/lib/marker-background.js";

const emailSchema = z.string().email("Please enter a valid email address");

const COLORS = ['#e8dcc8', '#dfd3bc', '#ede2d0'];
const STROKES = [
  { yPct: 0.38, angle:  0.8, thickPct: 0.38 },
  { yPct: 0.62, angle: -0.6, thickPct: 0.36 },
];

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const renderStrokes = useCallback(() => {
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

    // Measure the centered content container
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

    STROKES.forEach((s, i) => {
      const cy = H * s.yPct;
      const angleRad = s.angle * (Math.PI / 180);
      const sx = contentLeft - overshoot;
      const ex = contentRight + overshoot;
      const strokeLen = ex - sx;
      const rise = Math.sin(angleRad) * strokeLen * 0.5;

      drawHighlightStroke(ctx, {
        sx,
        sy: cy - rise,
        ex,
        ey: cy + rise,
        color: COLORS[i % COLORS.length],
        thickness: H * s.thickPct,
        opacity: 0.13,
      });
    });
  }, []);

  useEffect(() => {
    renderStrokes();
    window.addEventListener('resize', renderStrokes);
    return () => window.removeEventListener('resize', renderStrokes);
  }, [renderStrokes]);

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
              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-molding btn-molding-flip inline-flex h-10 items-center justify-center px-6 text-sm font-semibold uppercase tracking-[0.08em] text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
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
