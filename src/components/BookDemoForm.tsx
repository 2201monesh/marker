import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitHubSpotForm, HUBSPOT_FORMS } from "@/lib/hubspot";

const PERSONAL_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "mail.com",
  "protonmail.com",
  "zoho.com",
  "yandex.com",
  "gmx.com",
  "live.com",
  "msn.com",
  "me.com",
  "mac.com",
];

const workEmailSchema = z
  .string()
  .email("Please enter a valid email address")
  .refine(
    (email) => {
      const domain = email.split("@")[1]?.toLowerCase();
      return domain && !PERSONAL_EMAIL_DOMAINS.includes(domain);
    },
    { message: "Please use your work email address" }
  );

const bookDemoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: workEmailSchema,
  phone: z.string().min(7, "Please enter a valid phone number"),
  message: z.string().optional(),
});

type BookDemoData = z.infer<typeof bookDemoSchema>;

export default function BookDemoForm() {
  const [form, setForm] = useState<BookDemoData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [step, setStep] = useState<"form" | "calendar" | "confirmed">("form");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errors, setErrors] = useState<
    Partial<Record<keyof BookDemoData, string>>
  >({});
  const [submitError, setSubmitError] = useState("");

  function updateField(field: keyof BookDemoData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    const result = bookDemoSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof BookDemoData, string>> = {};
      for (const err of result.error.issues) {
        const field = err.path[0] as keyof BookDemoData;
        fieldErrors[field] = err.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setStatus("loading");
    setSubmitError("");

    const fields = [
      { objectTypeId: "0-1", name: "firstname", value: form.firstName },
      { objectTypeId: "0-1", name: "lastname", value: form.lastName },
      { objectTypeId: "0-1", name: "email", value: form.email },
      { objectTypeId: "0-1", name: "phone", value: form.phone },
    ];

    if (form.message) {
      fields.push({
        objectTypeId: "0-1",
        name: "message",
        value: form.message,
      });
    }

    const response = await submitHubSpotForm(HUBSPOT_FORMS.bookDemo, fields);

    if (response.success) {
      setStep("calendar");
    } else {
      setStatus("error");
      setSubmitError(response.error || "Something went wrong.");
    }
  }

  useEffect(() => {
    if (step !== "calendar") return;

    const container = document.getElementById("meetings-embed");
    if (!container) return;

    if (!container.querySelector('script[src*="MeetingsEmbedCode"]')) {
      const script = document.createElement("script");
      script.src =
        "https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js";
      script.type = "text/javascript";
      container.appendChild(script);
    }

    function handleMessage(event: MessageEvent) {
      if (event.data?.meetingBookSucceeded || event.data?.meetingCreated) {
        setStep("confirmed");
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [step]);

  if (step === "confirmed") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-foreground">
          You're all set, {form.firstName}!
        </h2>
        <p className="mt-3 text-muted-foreground">
          We've sent a calendar invite to {form.email}. Looking forward to
          showing you what Marker can do for your team.
        </p>
      </div>
    );
  }

  if (step === "calendar") {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">
            Thanks, {form.firstName}! Pick a time that works for you.
          </p>
        </div>
        <div
          id="meetings-embed"
          className="meetings-iframe-container"
          data-src="https://meetings-na2.hubspot.com/will-drevno/book-demo?embed=true"
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-foreground"
          >
            First name <span className="text-red-500">*</span>
          </label>
          <Input
            id="firstName"
            value={form.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            required
            className="mt-1"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-foreground"
          >
            Last name <span className="text-red-500">*</span>
          </label>
          <Input
            id="lastName"
            value={form.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            required
            className="mt-1"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-foreground"
        >
          Work email <span className="text-red-500">*</span>
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          required
          className="mt-1"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-foreground"
        >
          Phone number <span className="text-red-500">*</span>
        </label>
        <Input
          id="phone"
          type="tel"
          placeholder="(555) 123-4567"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          required
          className="mt-1"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-foreground"
        >
          What would make this call most useful for you?
        </label>
        <textarea
          id="message"
          rows={3}
          value={form.message}
          onChange={(e) => updateField("message", e.target.value)}
          className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
      {submitError && <p className="text-sm text-red-600">{submitError}</p>}
      <Button
        type="submit"
        disabled={status === "loading"}
        className="w-full"
        size="lg"
      >
        {status === "loading" ? "Submitting..." : "Continue"}
      </Button>
    </form>
  );
}
