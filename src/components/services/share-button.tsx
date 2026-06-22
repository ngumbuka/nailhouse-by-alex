import { useState, useEffect } from "react";
import { Share2, Copy, Check, MessageCircle, Facebook, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type ShareButtonProps = {
  title: string;
  text: string;
  path: string;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
};

export function ShareButton({
  title,
  text,
  path,
  className,
  variant = "outline",
  size = "icon",
  showLabel = false,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Resolve absolute URL dynamically
      setShareUrl(`${window.location.origin}${path}`);
    }
  }, [path]);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${text} — NailHouse`,
          url: shareUrl,
        });
        toast.success("Partagé avec succès !");
      } catch (err) {
        // Skip user abort errors
        if ((err as Error).name !== "AbortError") {
          console.error("Native share failed", err);
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Lien copié dans le presse-papiers !");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
      toast.error("Impossible de copier le lien.");
    }
  };

  const shareWhatsApp = () => {
    const message = encodeURIComponent(`${title}\n${text}\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");
    toast.success("Ouverture de WhatsApp...");
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank",
    );
  };

  // If native share is supported, we can trigger it directly or show the dropdown.
  // We'll use a dropdown on desktop for premium look, and native share on mobile.
  const isMobile =
    typeof navigator !== "undefined" && /Android|iPhone|iPad/i.test(navigator.userAgent);

  const triggerNativeShare = () => {
    if (isMobile && navigator.share) {
      handleNativeShare();
    }
  };

  return (
    <div className={cn("relative inline-block", className)} onClick={(e) => e.stopPropagation()}>
      {isMobile && navigator.share ? (
        <Button
          variant={variant}
          size={size}
          onClick={handleNativeShare}
          aria-label={showLabel ? undefined : `Partager ${title}`}
          className={cn(
            "rounded-full border-gold/40 text-gold hover:bg-gold/10 hover:text-gold transition-all duration-300",
            showLabel && "px-4 gap-2",
          )}
        >
          <Share2 className="h-4 w-4" />
          {showLabel && (
            <span className="font-sans text-xs tracking-wider uppercase">Partager</span>
          )}
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={variant}
              size={size}
              aria-label={showLabel ? undefined : `Partager ${title}`}
              className={cn(
                "rounded-full border-gold/40 text-gold hover:bg-gold/10 hover:text-gold transition-all duration-300 cursor-pointer",
                showLabel && "px-5 gap-2 h-10",
              )}
            >
              <Share2 className="h-4 w-4" />
              {showLabel && (
                <span className="font-sans text-xs tracking-wider uppercase">Partager</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 rounded-xl border-gold/20 bg-ink text-primary-foreground p-1 shadow-xl backdrop-blur-md"
          >
            <DropdownMenuItem
              onClick={handleCopy}
              className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg cursor-pointer focus:bg-gold/15 focus:text-gold"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-gold" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{copied ? "Copié !" : "Copier le lien"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={shareWhatsApp}
              className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg cursor-pointer focus:bg-gold/15 focus:text-gold"
            >
              <MessageCircle className="h-3.5 w-3.5 text-green-500 fill-green-500/10" />
              <span>WhatsApp</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={shareFacebook}
              className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg cursor-pointer focus:bg-gold/15 focus:text-gold"
            >
              <Facebook className="h-3.5 w-3.5 text-blue-500 fill-blue-500/10" />
              <span>Facebook</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
