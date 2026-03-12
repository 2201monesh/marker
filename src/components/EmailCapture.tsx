import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // TODO: integrate with CRM provider
    setSubmitted(true);
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Ready to stop chasing and start shipping?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Get early access to Marker and see what an always-on supply chain coordinator can do for your team.
          </p>

          {submitted ? (
            <p className="mt-8 text-primary font-medium">
              Thanks! We'll be in touch.
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
              <Button type="submit">Subscribe</Button>
            </form>
          )}

        </div>
      </div>
    </section>
  );
}
