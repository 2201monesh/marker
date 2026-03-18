import { forwardRef, useRef, useState } from "react";

import {
  AssetPreview,
  GuideToggle,
  exportNodeAsPng,
} from "@/components/branded-assets/AssetStudioPrimitives";

const EXPORT_WIDTH = 1098;
const EXPORT_HEIGHT = 648;
const TRIM_INSET = 24;
// MOO standard safe area is 48px inside the 1098x648 bleed canvas at 300 DPI.
// The full PNG is the bleed canvas. The actual designed card face lives inside
// the 24px trim inset so the visual design stays within the white trimmed card.
const CARD_FRAME_CLASS = "relative h-[648px] w-[1098px] overflow-hidden bg-white text-foreground";
const BLEED_ACCENT_CLASS =
  "absolute inset-y-0 left-0 z-10 w-[40px] bg-primary";
const TRIM_PANEL_CLASS = "absolute overflow-hidden bg-white";
const CARD_INSET_CLASS =
  "relative flex h-full flex-col px-[56px] pb-[132px] pt-[48px]";
const FOOTER_WRAP_CLASS =
  "absolute bottom-[40px] left-[56px] right-[56px] flex justify-end border-t border-foreground/10 pt-[14px]";
const FRONT_HEADLINE_CLASS =
  "text-[60px] font-bold leading-[0.92] tracking-tight";
const BACK_NAME_CLASS =
  "whitespace-nowrap text-[52px] font-bold leading-[0.92] tracking-tight";
const CONTACT_PRIMARY_CLASS =
  "text-[38px] font-semibold tracking-tight no-underline";
const CONTACT_SECONDARY_CLASS = "text-[30px] font-medium no-underline";
const FOOTER_URL_CLASS = "text-[34px] font-semibold tracking-tight";
const ROLE_CLASS = "text-[24px] font-medium text-muted-foreground";
const PEOPLE = [
  {
    slug: "will-drevno",
    firstName: "Will",
    lastName: "Drevno",
    title: "Co-founder",
    phone: "(646) 791-4211",
    phoneHref: "tel:+16467914211",
    email: "will@onmarker.com",
  },
  {
    slug: "richard-berwick",
    firstName: "Richard",
    lastName: "Berwick",
    title: "Co-founder",
    phone: "(628) 888-8006",
    phoneHref: "tel:+16288888006",
    email: "richard@onmarker.com",
  },
] as const;

type Side = "front" | "back";
type PersonSlug = (typeof PEOPLE)[number]["slug"];
type DownloadKey = `${(typeof PEOPLE)[number]["slug"]}-${Side}`;

const FrontCardArt = forwardRef<HTMLDivElement>(function FrontCardArt(_, ref) {
  return (
    <div
      ref={ref}
      className={CARD_FRAME_CLASS}
    >
      <div className={TRIM_PANEL_CLASS} style={{ inset: TRIM_INSET }}>
        <div className={CARD_INSET_CLASS}>
          <img src="/logo.png" alt="Marker" className="w-[164px]" />

          <div className="mt-[58px]">
            <p className={`${FRONT_HEADLINE_CLASS} text-foreground`}>
              Your always-on
            </p>
            <p className={`${FRONT_HEADLINE_CLASS} mt-[8px] text-primary`}>
              supply chain coordinator
            </p>
          </div>
        </div>

        <div className={FOOTER_WRAP_CLASS}>
          <p className={`${FOOTER_URL_CLASS} text-primary`}>
            onmarker.com
          </p>
        </div>
      </div>
      <div className={BLEED_ACCENT_CLASS} />
    </div>
  );
});

const PersonBackCardArt = forwardRef<
  HTMLDivElement,
  {
    firstName: string;
    lastName: string;
    title: string;
    phone: string;
    phoneHref: string;
    email: string;
  }
>(function PersonBackCardArt(
  { firstName, lastName, title, phone, phoneHref, email },
  ref
) {
  const fullName = `${firstName} ${lastName}`;

  return (
    <div
      ref={ref}
      className={CARD_FRAME_CLASS}
    >
      <div className={TRIM_PANEL_CLASS} style={{ inset: TRIM_INSET }}>
        <div className={CARD_INSET_CLASS}>
          <img src="/logo.png" alt="Marker" className="w-[164px]" />

          <div className="mt-[58px]">
            <h2 className={`${BACK_NAME_CLASS} text-foreground`}>
              {fullName}
            </h2>
            <p className={`mt-[12px] ${ROLE_CLASS}`}>
              {title}
            </p>
          </div>

          <div className="mt-[34px] max-w-[560px] space-y-[6px]">
            <a
              href={phoneHref}
              className={`block ${CONTACT_PRIMARY_CLASS} text-foreground`}
            >
              {phone}
            </a>
            <a
              href={`mailto:${email}`}
              className={`mt-[6px] block ${CONTACT_SECONDARY_CLASS} text-foreground`}
            >
              {email}
            </a>
          </div>
        </div>

        <div className={FOOTER_WRAP_CLASS}>
          <p className={`${FOOTER_URL_CLASS} text-primary`}>
            onmarker.com
          </p>
        </div>
      </div>
      <div className={BLEED_ACCENT_CLASS} />
    </div>
  );
});

export default function BusinessCardStudio({
  mooGuideSrc,
}: {
  mooGuideSrc?: string;
}) {
  const [downloading, setDownloading] = useState<DownloadKey | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const frontExportRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const backExportRefs = useRef<Record<string, HTMLDivElement | null>>({});

  async function handleDownload(personSlug: PersonSlug, side: Side) {
    const key = `${personSlug}-${side}` as DownloadKey;
    setDownloading(key);

    try {
      await exportNodeAsPng({
        filename: `marker-${personSlug}-${side}.png`,
        ref: {
          current:
            side === "front"
              ? frontExportRefs.current[personSlug]
              : backExportRefs.current[personSlug],
        },
        width: EXPORT_WIDTH,
        height: EXPORT_HEIGHT,
      });
    } finally {
      setDownloading(null);
    }
  }

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
            Business Card
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Simplified card previews with print-sized PNG export.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground md:text-xl">
            Each set exports as its own front and back PNG. The front stays
            brand-led, while the back carries the direct contact details for
            each co-founder.
          </p>
          {mooGuideSrc ? (
            <GuideToggle checked={showGuide} onChange={setShowGuide} />
          ) : null}
        </div>

        <div className="mt-12 space-y-14">
          {PEOPLE.map((person) => (
            <section
              key={person.slug}
              className="rounded-[28px] border border-border bg-muted/40 p-6 md:p-8"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                  {person.firstName} {person.lastName}
                </h2>
                <p className="mt-2 text-base text-muted-foreground">
                  {person.title} card set with direct phone and email.
                </p>
              </div>

              <div className="grid gap-10 lg:grid-cols-2">
                <AssetPreview
                  title="Front"
                  description="Tagline and website."
                  buttonLabel={
                    downloading === `${person.slug}-front`
                      ? "Exporting..."
                      : "Download PNG"
                  }
                  onDownload={() => handleDownload(person.slug, "front")}
                  disabled={downloading !== null}
                  width={EXPORT_WIDTH}
                  height={EXPORT_HEIGHT}
                  trimInset={TRIM_INSET}
                  showGuide={showGuide}
                  guideImageSrc={mooGuideSrc}
                >
                  <FrontCardArt />
                </AssetPreview>

                <AssetPreview
                  title="Back"
                  description="Name, title, phone, email, and website."
                  buttonLabel={
                    downloading === `${person.slug}-back`
                      ? "Exporting..."
                      : "Download PNG"
                  }
                  onDownload={() => handleDownload(person.slug, "back")}
                  disabled={downloading !== null}
                  width={EXPORT_WIDTH}
                  height={EXPORT_HEIGHT}
                  trimInset={TRIM_INSET}
                  showGuide={showGuide}
                  guideImageSrc={mooGuideSrc}
                >
                  <PersonBackCardArt
                    firstName={person.firstName}
                    lastName={person.lastName}
                    title={person.title}
                    phone={person.phone}
                    phoneHref={person.phoneHref}
                    email={person.email}
                  />
                </AssetPreview>
              </div>
            </section>
          ))}
        </div>
      </section>

      <div className="pointer-events-none fixed left-[-3000px] top-0 opacity-0">
        {PEOPLE.map((person) => (
          <div key={person.slug}>
            <FrontCardArt
              ref={(node) => {
                frontExportRefs.current[person.slug] = node;
              }}
            />
            <PersonBackCardArt
              ref={(node) => {
                backExportRefs.current[person.slug] = node;
              }}
              firstName={person.firstName}
              lastName={person.lastName}
              title={person.title}
              phone={person.phone}
              phoneHref={person.phoneHref}
              email={person.email}
            />
          </div>
        ))}
      </div>
    </>
  );
}
