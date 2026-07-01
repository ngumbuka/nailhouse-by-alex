import { cn } from "@/lib/utils";
import { resolveAssetUrl } from "@/lib/resolver";

type SoftImageProps = {
  src: string;
  alt: string;
  /** Tailwind aspect-ratio class, e.g. "aspect-[4/3]" */
  aspect?: string;
  /** Use larger border-radius and shadow */
  size?: "default" | "lg";
  className?: string;
  imgClassName?: string;
  loading?: "lazy" | "eager";
  children?: React.ReactNode;
};

/**
 * A professional soft image container with rounded corners,
 * warm shadow, and a gentle saturation filter.
 * Wraps any image in the NailHouse editorial style.
 */
export function SoftImage({
  src,
  alt,
  aspect = "aspect-[4/3]",
  size = "default",
  className,
  imgClassName,
  loading = "lazy",
  children,
}: SoftImageProps) {
  const resolvedSrc = resolveAssetUrl(src);

  return (
    <figure
      className={cn(
        "relative overflow-hidden",
        size === "lg" ? "img-soft-lg" : "img-soft",
        aspect,
        className,
      )}
    >
      <img
        src={resolvedSrc}
        alt={alt}
        loading={loading}
        className={cn(
          "img-fade-in h-full w-full object-cover transition duration-500",
          imgClassName,
        )}
      />
      {children}
    </figure>
  );
}
