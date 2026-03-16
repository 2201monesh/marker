import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
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
const BOOK_DEMO_URL = "https://meetings-na2.hubspot.com/will-drevno/book-demo";

export default function BookDemoForm() {
  const [form, setForm] = useState<BookDemoData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errors, setErrors] = useState<
    Partial<Record<keyof BookDemoData, string>>
  >({});
  const [submitError, setSubmitError] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  function updateField(field: keyof BookDemoData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setHasSubmitted(false);
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

    const bookingWindow = window.open("about:blank", "_blank");
    if (!bookingWindow) {
      setStatus("error");
      setSubmitError("Please allow pop-ups to open the booking page.");
      return;
    }

    bookingWindow.opener = null;

    bookingWindow.document.write(
      "<!doctype html><title>Opening booking page</title><body style='font-family: Inter, system-ui, sans-serif; padding: 24px; color: #1a1a1a;'>Opening booking page...</body>"
    );
    bookingWindow.document.close();

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
      bookingWindow.location.replace(BOOK_DEMO_URL);
      setStatus("idle");
      setHasSubmitted(true);
    } else {
      bookingWindow.close();
      setStatus("error");
      setSubmitError(response.error || "Something went wrong.");
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="max-w-lg">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Book a demo
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          See how Marker fits into your current workflow.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-lg space-y-6">
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
          {status === "loading"
            ? "Opening booking page..."
            : hasSubmitted
              ? "Open booking page again"
              : "See available times"}
        </Button>
        {hasSubmitted && (
          <div className="rounded-lg border border-primary/20 bg-primary/8 px-4 py-3 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="text-foreground">
                <p className="font-medium">Your info was submitted.</p>
                <p className="mt-1 text-muted-foreground">
                  If the booking page didn&apos;t open automatically,{" "}
                  <a
                    href={BOOK_DEMO_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-foreground underline underline-offset-4"
                  >
                    open it here
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
