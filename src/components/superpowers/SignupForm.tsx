import { useEffect, useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { HUBSPOT_FORMS, submitHubSpotForm } from "@/lib/hubspot";

const STRIPE_PAYMENT_LINK =
  "https://buy.stripe.com/9B67sNd4KgXZbsE4LgbfO02";

const TEAM_SIZE_HS_VALUE: Record<string, string> = {
  "Just me": "just_me",
  "2–5": "2_5",
  "6–15": "6_15",
  "16–25": "16_25",
  "26+": "26_plus",
};

const formSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid work email"),
  company: z.string().min(1, "Please enter your company"),
  role: z.string().min(1, "Please pick the option that fits best"),
  teamSize: z.string().min(1, "Please pick a team size"),
  inboxProvider: z.enum(["gmail", "outlook", "other"], {
    message: "Please pick your inbox provider",
  }),
});

type FormState = z.infer<typeof formSchema>;

const ROLE_OPTIONS = [
  "PD / Sourcing",
  "Production Manager",
  "Buyer / Merchandiser",
  "VP / Head of PD",
  "Founder / CEO",
  "Other",
];

const TEAM_SIZES = ["Just me", "2–5", "6–15", "16–25", "26+"];

const STORAGE_KEY = "superpowers-trial";

const EMPTY_FORM: FormState = {
  fullName: "",
  email: "",
  company: "",
  role: "",
  teamSize: "",
  inboxProvider: "gmail",
};

function readPersistedForm(): FormState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_FORM;
    const parsed = JSON.parse(raw) as Partial<{
      name: string;
      fullName: string;
      email: string;
      company: string;
      role: string;
      teamSize: string;
      inboxProvider: FormState["inboxProvider"];
    }>;
    return {
      fullName: parsed.fullName ?? parsed.name ?? "",
      email: parsed.email ?? "",
      company: parsed.company ?? "",
      role: parsed.role ?? "",
      teamSize: parsed.teamSize ?? "",
      inboxProvider:
        parsed.inboxProvider === "gmail" ||
        parsed.inboxProvider === "outlook" ||
        parsed.inboxProvider === "other"
          ? parsed.inboxProvider
          : "gmail",
    };
  } catch {
    return EMPTY_FORM;
  }
}

function persistForm(form: FormState) {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        // Keep `name` for backward compatibility with the onboarding banner.
        name: form.fullName,
        fullName: form.fullName,
        email: form.email,
        company: form.company,
        role: form.role,
        teamSize: form.teamSize,
        inboxProvider: form.inboxProvider,
      })
    );
  } catch {
    // sessionStorage unavailable (private mode); non-fatal.
  }
}

export default function SignupForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [hydrated, setHydrated] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {}
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showRedirect, setShowRedirect] = useState(false);

  useEffect(() => {
    setForm(readPersistedForm());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persistForm(form);
  }, [form, hydrated]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");

    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      const issues: Partial<Record<keyof FormState, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormState;
        if (!issues[key]) issues[key] = issue.message;
      }
      setErrors(issues);
      return;
    }

    setSubmitting(true);
    persistForm(form);

    // Best-effort HubSpot lead capture before redirecting to Stripe — if
    // HubSpot fails or times out we still send the user to checkout, since
    // conversion is the priority.
    const [firstName, ...rest] = form.fullName.trim().split(/\s+/);
    const lastName = rest.join(" ");
    await submitHubSpotForm(HUBSPOT_FORMS.superpowersTrial, [
      { objectTypeId: "0-1", name: "email", value: form.email },
      { objectTypeId: "0-1", name: "firstname", value: firstName || "" },
      { objectTypeId: "0-1", name: "lastname", value: lastName },
      { objectTypeId: "0-1", name: "company", value: form.company },
      { objectTypeId: "0-1", name: "jobtitle", value: form.role },
      {
        objectTypeId: "0-1",
        name: "superpowers_team_size",
        value: TEAM_SIZE_HS_VALUE[form.teamSize] || "",
      },
      {
        objectTypeId: "0-1",
        name: "superpowers_inbox_provider",
        value: form.inboxProvider,
      },
    ]).catch(() => {
      /* best-effort */
    });

    // Per ADR-0002, link the anonymous Amplitude device to the known email so
    // pre-trial browsing history merges with the identified user.
    if (window.amplitude) {
      try {
        window.amplitude.setUserId(form.email);
        window.amplitude.track("Superpowers Trial Started", {
          company: form.company,
          role: form.role,
          team_size: form.teamSize,
          inbox_provider: form.inboxProvider,
        });
      } catch {
        /* non-fatal */
      }
    }

    try {
      const url = new URL(STRIPE_PAYMENT_LINK);
      url.searchParams.set("prefilled_email", form.email);
      // client_reference_id surfaces in Stripe so lead context can be matched
      // back to the form submission in the dashboard / webhook later.
      url.searchParams.set(
        "client_reference_id",
        `${form.company} | ${form.role} | ${form.teamSize} | ${form.inboxProvider}`.slice(
          0,
          200
        )
      );
      const stripeUrl = url.toString();
      setShowRedirect(true);
      setTimeout(() => {
        window.location.href = stripeUrl;
      }, 6000);
    } catch {
      setSubmitting(false);
      setSubmitError(
        "Something went wrong. Please try again or email hello@onmarker.com."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="signup-form">
      <div className="signup-grid">
        <Field label="Full name" error={errors.fullName}>
          <Input
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            required
          />
        </Field>

        <Field label="Work email" error={errors.email}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="jane@brand.com"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
        </Field>

        <Field label="Company" error={errors.company}>
          <Input
            type="text"
            autoComplete="organization"
            placeholder="Your brand"
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            required
          />
        </Field>

        <Field label="Your role" error={errors.role}>
          <select
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
            className="signup-select input-inset"
            required
          >
            <option value="">Select…</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Supply chain team size" error={errors.teamSize}>
          <select
            value={form.teamSize}
            onChange={(e) => update("teamSize", e.target.value)}
            className="signup-select input-inset"
            required
          >
            <option value="">Select…</option>
            {TEAM_SIZES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Where you read email" error={errors.inboxProvider} as="fieldset">
          <div className="signup-radio-row">
            <label
              className={`signup-radio ${form.inboxProvider === "gmail" ? "is-active" : ""}`}
            >
              <input
                type="radio"
                name="inboxProvider"
                value="gmail"
                checked={form.inboxProvider === "gmail"}
                onChange={() => update("inboxProvider", "gmail")}
              />
              <span>Gmail</span>
            </label>
            <label
              className={`signup-radio ${form.inboxProvider === "outlook" ? "is-active" : ""}`}
            >
              <input
                type="radio"
                name="inboxProvider"
                value="outlook"
                checked={form.inboxProvider === "outlook"}
                onChange={() => update("inboxProvider", "outlook")}
              />
              <span>Outlook</span>
            </label>
            <label
              className={`signup-radio ${form.inboxProvider === "other" ? "is-active" : ""}`}
            >
              <input
                type="radio"
                name="inboxProvider"
                value="other"
                checked={form.inboxProvider === "other"}
                onChange={() => update("inboxProvider", "other")}
              />
              <span>Somewhere else</span>
            </label>
          </div>
        </Field>
      </div>

      {submitError && <p className="signup-error">{submitError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="btn-molding inline-flex h-12 w-full items-center justify-center px-8 text-sm font-semibold tracking-wide text-primary transition-colors cursor-pointer disabled:opacity-50"
      >
        {submitting ? "Registering…" : "Register your account"}
      </button>

      <p className="signup-fineprint">
        By registering you agree to our{" "}
        <a href="/superpowers/terms" className="signup-link">
          Terms
        </a>{" "}
        and{" "}
        <a href="/superpowers/privacy" className="signup-link">
          Privacy Policy
        </a>
        .
      </p>

      {showRedirect && (
        <div
          className="signup-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="signup-modal-title"
        >
          <div className="signup-modal">
            <div className="signup-modal-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="5 12 10 17 19 7" />
              </svg>
            </div>
            <h2 id="signup-modal-title" className="signup-modal-title">
              Account registered
            </h2>
            <p className="signup-modal-body">
              Redirecting you to Stripe to add a card on file. We won't charge anything until day 31 — cancel any time before then and pay nothing.
            </p>
            <div className="signup-modal-spinner" aria-hidden="true" />
          </div>
        </div>
      )}
    </form>
  );
}

function Field({
  label,
  error,
  children,
  as: Wrapper = "label",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  as?: "label" | "div" | "fieldset";
}) {
  const LabelTag = Wrapper === "fieldset" ? "legend" : "span";
  return (
    <Wrapper className="signup-field">
      <LabelTag className="signup-field-label">{label}</LabelTag>
      {children}
      {error && <span className="signup-field-error">{error}</span>}
    </Wrapper>
  );
}

