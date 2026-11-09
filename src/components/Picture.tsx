import { photo } from "@/lib/content";

// Serves build-time WebP sizes (scripts/optimize-images.mjs) with the original JPG as fallback.
export function Picture({ src, alt, sizes = "100vw", priority = false, className }: { src: string; alt?: string; sizes?: string; priority?: boolean; className?: string }) {
  const p = photo(src);
  const set = [640, 1080, 1600]
    .filter((w) => w <= p.w)
    .map((w) => `/opt/${src}-${w}.webp ${w}w`)
    .join(", ");
  return (
    <picture className={className}>
      <source type="image/webp" srcSet={set} sizes={sizes} />
      <img src={`/${src}.jpg`} alt={alt ?? p.alt} width={p.w} height={p.h} loading={priority ? "eager" : "lazy"} decoding="async" fetchPriority={priority ? "high" : undefined} />
    </picture>
  );
}
