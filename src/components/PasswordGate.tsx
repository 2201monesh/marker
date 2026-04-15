import { useState, useEffect, type ReactNode } from "react";

// ┌─────────────────────────────────────────────────────┐
// │  SET YOUR DEMO PASSWORD HERE                        │
// │  Run this in your terminal to generate a new hash:  │
// │                                                     │
// │  echo -n "yourpassword" | shasum -a 256             │
// │                                                     │
// │  Then paste the hash below.                         │
// └─────────────────────────────────────────────────────┘
const PASSWORD_HASH =
  "80c1fef0b4cb0084165173306f4a45ae7a84dcda19c79c365e964c30121ff345";

const STORAGE_KEY = "marker-demos-auth";

async function hashPassword(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface PasswordGateProps {
  children: ReactNode;
}

export default function PasswordGate({ children }: PasswordGateProps) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      setAuthed(true);
    }
    setChecking(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hash = await hashPassword(value);
    if (hash === PASSWORD_HASH) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setAuthed(true);
    } else {
      setError(true);
      setValue("");
    }
  };

  if (checking) return null;

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xs rounded-lg border border-border bg-white p-6 shadow-sm"
        >
          <div className="mb-1 text-[13px] font-bold uppercase tracking-[1.5px] text-primary">
            Marker
          </div>
          <div className="mb-5 text-[12px] text-muted-foreground">
            Enter the password to view this demo.
          </div>
          <input
            type="password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            placeholder="Password"
            autoFocus
            className="mb-3 w-full rounded-md border border-border px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {error && (
            <div className="mb-3 text-[12px] text-red-600">
              Incorrect password.
            </div>
          )}
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-3 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
