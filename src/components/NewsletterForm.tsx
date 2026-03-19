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
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
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
              <Button type="submit" disabled={status === "loading"}>
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
