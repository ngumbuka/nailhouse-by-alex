import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { listActiveVideos } from "@/lib/booking.functions";
import { resolveAssetUrl } from "@/lib/resolver";

interface ServiceVideoProps {
  serviceName: string;
  categorySlug: string;
}

export function ServiceVideo({ serviceName, categorySlug }: ServiceVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isPedicure = categorySlug.includes("pied") || serviceName.toLowerCase().includes("pedi");

  const { data: videos } = useQuery({
    queryKey: ["videos"],
    queryFn: () => listActiveVideos(),
  });

  // Pick a video that matches the category if possible
  const categoryMatchedVideo = videos?.find(
    (v) =>
      categorySlug.toLowerCase().includes(v.category.toLowerCase()) ||
      v.category.toLowerCase().includes(categorySlug.toLowerCase()),
  );

  // Premium stock video loops for nails & spa - fallback
  const fallbackUrl = isPedicure ? "/placeholder-pedicure.html" : "/placeholder-manicure.html";

  const rawUrl = categoryMatchedVideo?.url || fallbackUrl;
  const videoUrl = resolveAssetUrl(rawUrl);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch((err) => console.log("Video play error:", err));
      setIsPlaying(true);
    }
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration || 1;
    setProgress((current / duration) * 100);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const duration = videoRef.current.duration || 0;
    videoRef.current.currentTime = (clickX / width) * duration;
  };

  // Autoplay muted on mount/scroll
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      setIsMuted(true);
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Browsers block autoplay if not interacted with first sometimes
          setIsPlaying(false);
        });
    }
  }, [videoUrl]);

  return (
    <section className="bg-ink text-white py-16 md:py-24 overflow-hidden border-t border-b border-white/5">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="grid gap-10 md:grid-cols-12 items-center">
          {/* Text content block */}
          <div className="md:col-span-4 flex flex-col justify-center">
            <p className="label-luxe text-gold">L'expérience en mouvement</p>
            <h2 className="mt-4 font-serif text-3xl text-white leading-tight md:text-4xl">
              Atmosphère & Gestuelle
            </h2>
            <div className="mt-6 h-px w-10 bg-gold" />
            <p className="mt-6 text-sm leading-relaxed text-white/70">
              Découvrez les coulisses de notre protocole en vidéo — la précision chirurgicale de nos
              gestes, la douceur du massage et l'attention minutieuse accordée à chaque détail pour
              faire de votre pose de {serviceName.toLowerCase()} un moment inoubliable.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={handlePlayPause}
                className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-white/10 transition cursor-pointer"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                <span>{isPlaying ? "Pause" : "Lecture"}</span>
              </button>
            </div>
          </div>

          {/* Video Player Container */}
          <div className="md:col-span-8 relative rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10 aspect-[16/9]">
            {videoUrl.endsWith(".html") ? (
              <>
                <iframe
                  src={videoUrl}
                  className="w-full h-full border-0 object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
                  title={serviceName}
                  sandbox="allow-scripts allow-same-origin"
                />
                {/* Minimal elegant overlay for iframe placeholder */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-5 flex items-center justify-between text-white pointer-events-none">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gold">
                    Présentation de l'Atelier
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-white/50">
                    {serviceName} · Yaoundé
                  </span>
                </div>
              </>
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  loop
                  playsInline
                  muted={isMuted}
                  onTimeUpdate={handleTimeUpdate}
                  onClick={handlePlayPause}
                  className="w-full h-full object-cover cursor-pointer opacity-85 hover:opacity-100 transition-opacity duration-300"
                />

                {/* Custom elegant player controls overlays */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 flex flex-col gap-3">
                  {/* Progress Bar */}
                  <div
                    onClick={handleProgressBarClick}
                    className="h-1 w-full bg-white/20 rounded-full overflow-hidden cursor-pointer relative hover:h-1.5 transition-all"
                  >
                    <div
                      className="h-full bg-gold transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Bottom controls */}
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handlePlayPause}
                        className="p-2 hover:text-gold transition cursor-pointer"
                        aria-label={isPlaying ? "Pause" : "Lecture"}
                      >
                        {isPlaying ? (
                          <Pause className="h-4.5 w-4.5" />
                        ) : (
                          <Play className="h-4.5 w-4.5" />
                        )}
                      </button>
                      <button
                        onClick={handleMuteToggle}
                        className="p-2 hover:text-gold transition cursor-pointer"
                        aria-label={isMuted ? "Activer le son" : "Désactiver le son"}
                      >
                        {isMuted ? (
                          <VolumeX className="h-4.5 w-4.5" />
                        ) : (
                          <Volume2 className="h-4.5 w-4.5" />
                        )}
                      </button>
                    </div>
                    <span className="text-[9px] uppercase tracking-widest text-white/50">
                      {serviceName} · Yaoundé
                    </span>
                  </div>
                </div>

                {/* Large Glowing Center Play Button overlay when paused */}
                {!isPlaying && (
                  <div
                    onClick={handlePlayPause}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer transition-colors duration-300"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/90 text-white shadow-xl hover:scale-105 transition-transform duration-300 animate-pulse">
                      <Play className="h-6 w-6 fill-white ml-1" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
