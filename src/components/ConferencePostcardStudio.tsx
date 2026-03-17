import { forwardRef, useRef, useState } from "react";

import {
  AssetPreview,
  GuideToggle,
  exportNodeAsPng,
} from "@/components/branded-assets/AssetStudioPrimitives";

const EXPORT_WIDTH = 1848;
const EXPORT_HEIGHT = 1248;
const TRIM_INSET = 24;
const FRAME_CLASS =
  "relative h-[1248px] w-[1848px] overflow-hidden bg-white text-foreground";
const BLEED_ACCENT_CLASS =
  "absolute inset-y-0 left-0 z-10 w-[40px] bg-primary";
const TRIM_PANEL_CLASS = "absolute overflow-hidden bg-white";
const INSET_CLASS =
  "relative flex h-full flex-col px-[112px] pb-[248px] pt-[92px]";
const FOOTER_WRAP_CLASS =
  "absolute bottom-[86px] left-[112px] right-[112px] flex justify-end border-t border-foreground/10 pt-[28px]";
const HEADLINE_CLASS =
  "text-[136px] font-bold leading-[0.92] tracking-tight text-foreground";
const BODY_CLASS = "text-[52px] font-medium leading-[1.18] text-muted-foreground";
const FOOTER_CLASS = "text-[62px] font-semibold tracking-tight text-primary";
const BACK_HEADLINE_CLASS =
  "text-[110px] font-bold leading-[0.92] tracking-tight text-foreground";
const BULLET_TEXT_CLASS =
  "text-[50px] font-medium leading-[1.14] tracking-tight text-foreground";
const CONTACT_CLASS =
  "text-[42px] font-medium tracking-tight text-foreground no-underline";

const FrontPostcardArt = forwardRef<HTMLDivElement>(function FrontPostcardArt(
  _,
  ref
) {
  return (
    <div ref={ref} className={FRAME_CLASS}>
      <div className={TRIM_PANEL_CLASS} style={{ inset: TRIM_INSET }}>
        <div className={INSET_CLASS}>
          <img src="/logo.png" alt="Marker" className="w-[300px]" />

          <div className="mt-[132px] max-w-[1220px]">
            <p className={HEADLINE_CLASS}>Your always-on</p>
            <p className={`${HEADLINE_CLASS} mt-[14px] text-primary`}>
              supply chain
            </p>
            <p className={`${HEADLINE_CLASS} mt-[14px]`}>coordinator</p>
          </div>

          <p className={`mt-[52px] max-w-[980px] ${BODY_CLASS}`}>
            AI orchestration that keeps retail handoffs, follow-ups, and next
            steps moving before they turn into misses.
          </p>
        </div>

        <div className={FOOTER_WRAP_CLASS}>
          <p className={FOOTER_CLASS}>onmarker.com</p>
        </div>
      </div>
      <div className={BLEED_ACCENT_CLASS} />
    </div>
  );
});

const BackPostcardArt = forwardRef<HTMLDivElement>(function BackPostcardArt(
  _,
  ref
) {
  return (
    <div ref={ref} className={FRAME_CLASS}>
      <div className={TRIM_PANEL_CLASS} style={{ inset: TRIM_INSET }}>
        <div className={INSET_CLASS}>
          <img src="/logo.png" alt="Marker" className="w-[300px]" />

          <div className="mt-[128px] max-w-[1180px]">
            <h2 className={BACK_HEADLINE_CLASS}>
              Keep every
              <br />
              handoff moving.
            </h2>
          </div>

          <div className="mt-[60px] max-w-[1220px] space-y-[22px]">
            {[
              "Sync data across teams and systems.",
              "Track blockers before they become misses.",
              "Move work forward without waiting on follow-up.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-[22px]">
                <div className="mt-[18px] h-[16px] w-[16px] rounded-full bg-primary" />
                <p className={BULLET_TEXT_CLASS}>{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-[64px] flex flex-wrap gap-x-[28px] gap-y-[14px]">
            <a href="mailto:will@onmarker.com" className={CONTACT_CLASS}>
              will@onmarker.com
            </a>
            <a href="mailto:richard@onmarker.com" className={CONTACT_CLASS}>
              richard@onmarker.com
            </a>
          </div>
        </div>

        <div className={FOOTER_WRAP_CLASS}>
          <p className={FOOTER_CLASS}>onmarker.com</p>
        </div>
      </div>
      <div className={BLEED_ACCENT_CLASS} />
    </div>
  );
});

export default function ConferencePostcardStudio({
  mooGuideSrc,
}: {
  mooGuideSrc?: string;
}) {
  const [downloading, setDownloading] = useState<"front" | "back" | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  const frontExportRef = useRef<HTMLDivElement>(null);
  const backExportRef = useRef<HTMLDivElement>(null);

  async function handleDownload(side: "front" | "back") {
    setDownloading(side);

    try {
      await exportNodeAsPng({
        filename: `marker-conference-postcard-${side}.png`,
        ref: side === "front" ? frontExportRef : backExportRef,
        width: EXPORT_WIDTH,
        height: EXPORT_HEIGHT,
      });
    } finally {
      setDownloading(null);
    }
  }

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
            Conference Postcard
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Postcard-size handout in the same brand system.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground md:text-xl">
            This is set up against MOO&apos;s standard 6 x 4 inch landscape
            postcard template, including bleed, trim, and safe-area handling
            for local print prep.
          </p>
          {mooGuideSrc ? (
            <GuideToggle checked={showGuide} onChange={setShowGuide} />
          ) : null}
        </div>

        <div className="mt-12 space-y-12">
          <AssetPreview
            title="Front"
            description="Brand message and website."
            buttonLabel={downloading === "front" ? "Exporting..." : "Download PNG"}
            onDownload={() => handleDownload("front")}
            disabled={downloading !== null}
            width={EXPORT_WIDTH}
            height={EXPORT_HEIGHT}
            trimInset={TRIM_INSET}
            className="mx-auto max-w-[1280px]"
            showGuide={showGuide}
            guideImageSrc={mooGuideSrc}
          >
            <FrontPostcardArt />
          </AssetPreview>

          <AssetPreview
            title="Back"
            description="Three-value summary plus direct contact emails."
            buttonLabel={downloading === "back" ? "Exporting..." : "Download PNG"}
            onDownload={() => handleDownload("back")}
            disabled={downloading !== null}
            width={EXPORT_WIDTH}
            height={EXPORT_HEIGHT}
            trimInset={TRIM_INSET}
            className="mx-auto max-w-[1280px]"
            showGuide={showGuide}
            guideImageSrc={mooGuideSrc}
          >
            <BackPostcardArt />
          </AssetPreview>
        </div>
      </section>

      <div className="pointer-events-none fixed left-[-4000px] top-0 opacity-0">
        <FrontPostcardArt ref={frontExportRef} />
        <BackPostcardArt ref={backExportRef} />
      </div>
    </>
  );
}
