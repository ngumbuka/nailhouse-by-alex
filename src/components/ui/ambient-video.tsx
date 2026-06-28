import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  poster: string;
  alt?: string;
  className?: string;
  /** When false, the poster is shown and the video never autoplays. */
  enabled?: boolean;
};

/**
 * Ambient looping background video — muted, autoplay, loops.
 * Falls back to the poster image when the user prefers reduced motion,
 * or until the video has actually started playing.
 */
export function AmbientVideo({ src, poster, alt = "", className, enabled = true }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  const shouldPlay = enabled && !reduceMotion;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={poster}
        alt={alt}
        aria-hidden={shouldPlay && playing ? "true" : undefined}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
          shouldPlay && playing ? "opacity-0" : "opacity-100",
        )}
      />
      {shouldPlay && (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onPlaying={() => setPlaying(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
            playing ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </div>
  );
}
