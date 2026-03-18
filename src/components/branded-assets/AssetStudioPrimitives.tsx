import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { getFontEmbedCSS, toPng } from "html-to-image";

import { Button } from "@/components/ui/button";

type ExportPngOptions = {
  filename: string;
  ref: RefObject<HTMLDivElement | null>;
  width: number;
  height: number;
};

type AssetPreviewProps = {
  title: string;
  description: string;
  buttonLabel: string;
  onDownload: () => void;
  disabled: boolean;
  width: number;
  height: number;
  trimInset: number;
  className?: string;
  showGuide?: boolean;
  guideImageSrc?: string;
  children: ReactNode;
};

type GuideToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function exportNodeAsPng({
  filename,
  ref,
  width,
  height,
}: ExportPngOptions) {
  if (!ref.current) return;

  const fontEmbedCSS = await getFontEmbedCSS(ref.current);
  const dataUrl = await toPng(ref.current, {
    cacheBust: true,
    pixelRatio: 1,
    canvasWidth: width,
    canvasHeight: height,
    backgroundColor: "#ffffff",
    fontEmbedCSS,
  });

  downloadDataUrl(dataUrl, filename);
}

function ScaledArtboard({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: ReactNode;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const element = shellRef.current;
    if (!element) return;

    const updateScale = () => {
      const nextScale = element.clientWidth / width;
      setScale(nextScale || 1);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(element);

    return () => observer.disconnect();
  }, [width]);

  return (
    <div
      ref={shellRef}
      className="relative w-full"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width,
          height,
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function GuideToggle({ checked, onChange }: GuideToggleProps) {
  return (
    <label className="mt-6 inline-flex items-center gap-3 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-primary"
      />
      Show MOO guide overlay
    </label>
  );
}

export function AssetPreview({
  title,
  description,
  buttonLabel,
  onDownload,
  disabled,
  width,
  height,
  trimInset,
  className,
  showGuide,
  guideImageSrc,
  children,
}: AssetPreviewProps) {
  const trimInsetX = `${(trimInset / width) * 100}%`;
  const trimInsetY = `${(trimInset / height) * 100}%`;

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button type="button" size="lg" onClick={onDownload} disabled={disabled}>
          {buttonLabel}
        </Button>
      </div>
      <div className="relative">
        <ScaledArtboard width={width} height={height}>
          {children}
        </ScaledArtboard>
        {!showGuide || !guideImageSrc ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute border border-foreground/15"
            style={{
              left: trimInsetX,
              right: trimInsetX,
              top: trimInsetY,
              bottom: trimInsetY,
            }}
          />
        ) : null}
        {showGuide && guideImageSrc ? (
          <img
            src={guideImageSrc}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-35"
          />
        ) : null}
      </div>
    </div>
  );
}
