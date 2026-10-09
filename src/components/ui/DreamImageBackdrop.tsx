import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePublicDreamImages } from "@/hooks/usePublicDreamImages";

interface DreamImageBackdropProps {
  /** Extra classes on the absolutely-positioned backdrop wrapper. */
  className?: string;
  /** ms between crossfades. */
  intervalMs?: number;
  /** 0–1 darkening over the imagery for text legibility. */
  dim?: number;
}

/**
 * Full-bleed, slowly panning (Ken Burns) cinematic backdrop built from real
 * public dream imagery generated in the app. Crossfades between images and
 * always renders a gradient fallback beneath, so it is never blank while
 * loading or when there are no public dreams. Honors prefers-reduced-motion
 * (the kenburns keyframe + transitions are neutralized globally in index.css).
 *
 * Drop it as the first child of a `relative`/`fixed` container; it is
 * pointer-events-none and sits behind the content.
 */
export default function DreamImageBackdrop({
  className = "",
  intervalMs = 6500,
  dim = 0.55,
}: DreamImageBackdropProps) {
  const images = usePublicDreamImages(8);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), intervalMs);
    return () => clearInterval(t);
  }, [images.length, intervalMs]);

  const current = images.length ? images[idx % images.length] : undefined;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden>
      {/* Gradient fallback — always present (loading / no public dreams). */}
      <div className="absolute inset-0 dream-background" />

      {/* Crossfading Ken-Burns dream image. */}
      <AnimatePresence>
        {current && (
          <motion.div
            key={current}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          >
            <img
              src={current}
              alt=""
              className="w-full h-full object-cover"
              style={{ animation: "kenburns 16s ease-out forwards" }}
              draggable={false}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legibility scrims: overall dim + top/bottom fades to the app background. */}
      <div className="absolute inset-0" style={{ background: `hsl(var(--background) / ${dim})` }} />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/85 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/75 to-transparent" />
    </div>
  );
}
