import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitHubSpotForm, HUBSPOT_FORMS } from "@/lib/hubspot";

const emailSchema = z.string().email("Please enter a valid email address");

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");

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
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-8">
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
