import Image from "next/image";
import clsx from "clsx";

export type ShotName = "overview" | "invoices" | "invoice" | "client";

// Screenshots are 1440×900 CSS pixels (see scripts/screenshots.mts).
const SHOT = { width: 1440, height: 900 };

/** Where the page content starts: right of the open sidebar, below the top bar. */
export const CONTENT_CROP = { x: 240, y: 57 };

/**
 * A real screenshot of the app (from `pnpm screenshots`) in a browser frame.
 * Both themes are rendered and CSS shows the one that matches the page.
 * `crop` hides everything left of x and above y (in screenshot CSS pixels), which
 * makes the content bigger when the frame is small.
 */
export function ProductShot({
  name,
  alt,
  eager,
  crop,
  sizes = "(min-width: 1280px) 1152px, 100vw",
  className,
}: {
  name: ShotName;
  alt: string;
  eager?: boolean;
  crop?: { x: number; y: number };
  sizes?: string;
  className?: string;
}) {
  const common = {
    width: SHOT.width * 2,
    height: SHOT.height * 2,
    sizes,
    loading: eager ? "eager" : "lazy",
  } as const;

  const visible = crop && { width: SHOT.width - crop.x, height: SHOT.height - crop.y };
  const imageStyle =
    crop && visible
      ? {
          position: "absolute" as const,
          maxWidth: "none",
          width: `${(SHOT.width / visible.width) * 100}%`,
          left: `${(-crop.x / visible.width) * 100}%`,
          top: `${(-crop.y / visible.height) * 100}%`,
        }
      : undefined;

  const images = (
    <>
      <Image {...common} src={`/screenshots/${name}-light.webp`} alt={alt} style={imageStyle} className="block h-auto w-full dark:hidden" />
      <Image {...common} src={`/screenshots/${name}-dark.webp`} alt={alt} style={imageStyle} className="hidden h-auto w-full dark:block" />
    </>
  );

  return (
    <figure
      className={clsx(
        "overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/10 ring-1 ring-black/5 dark:shadow-black/50 dark:ring-white/5",
        className,
      )}
    >
      <div className="flex h-8 items-center gap-1.5 border-b border-border px-3 sm:h-9" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
      </div>
      {visible ? (
        <div className="relative overflow-hidden" style={{ aspectRatio: `${visible.width} / ${visible.height}` }}>
          {images}
        </div>
      ) : (
        images
      )}
    </figure>
  );
}
