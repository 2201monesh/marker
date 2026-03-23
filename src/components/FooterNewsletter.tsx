import { useState } from "react";
import { z } from "zod";
import { submitHubSpotForm, HUBSPOT_FORMS } from "@/lib/hubspot";

const emailSchema = z.string().email("Please enter a valid email address");

export default function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
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

  if (status === "success") {
    return (
      <p className="text-sm text-primary font-medium">You're on the list!</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <label htmlFor="footer-email" className="text-sm text-muted-foreground whitespace-nowrap font-medium">
        Get updates
      </label>
      <input
        id="footer-email"
        type="email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="h-8 w-48 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="h-8 rounded-md px-3 text-xs font-semibold uppercase tracking-wider text-primary border border-primary/20 bg-transparent transition-colors hover:bg-primary/5 disabled:opacity-50 cursor-pointer"
      >
        {status === "loading" ? "..." : "Subscribe"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </form>
  );
}
