import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Hero() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // TODO: integrate with CRM provider
    setSubmitted(true);
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-24 md:py-32">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Turn your sourcing team into a powerhouse
        </h1>
        <p className="mt-6 text-lg text-muted-foreground md:text-xl">
          Marker captures communication across email, WeChat, and WhatsApp, so
          your team can focus on high-leverage work instead of chasing messages.
        </p>
        <div className="mt-10">
          {submitted ? (
            <p className="text-primary font-medium text-lg">
              Thanks! We'll reach out shortly.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-md">
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-12"
              />
              <Button type="submit" size="lg">
                Request a Demo
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
