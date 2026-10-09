import React, { useEffect, useRef, useState } from "react";
import { X, Play, Pause, SkipBack, SkipForward, Download, Share2, Maximize } from "lucide-react";
import { toast } from "sonner";

interface CinematicPlayerProps {
  videoUrl: string;
  title?: string;
  onClose: () => void;
}

const fmt = (s: number) => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

/** Full-screen cinematic video player with scrubber + transport controls. */
const CinematicPlayer: React.FC<CinematicPlayerProps> = ({ videoUrl, title, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const seekBy = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta));
  };

  const onScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const t = (Number(e.target.value) / 100) * (v.duration || 0);
    v.currentTime = t;
    setCurrent(t);
  };

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: title || "My dream cinematic", url: videoUrl });
      } else {
        await navigator.clipboard.writeText(videoUrl);
        toast.success("Link copied");
      }
    } catch {
      /* user cancelled */
    }
  };

  const fullscreen = () => {
    const v = videoRef.current as any;
    if (!v) return;
    (v.requestFullscreen || v.webkitEnterFullscreen || v.webkitRequestFullscreen)?.call(v);
  };

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[130] bg-black flex flex-col" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={onClose} className="text-white/80 hover:text-white p-1 -ml-1">
          <X className="h-6 w-6" />
        </button>
        <p className="text-white font-semibold truncate">{title || "Cinematic"}</p>
      </div>

      {/* Video */}
      <button className="relative flex-1 flex items-center justify-center" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={videoUrl}
          className="max-h-full max-w-full"
          playsInline
          onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration)}
          onTimeUpdate={(e) => setCurrent((e.target as HTMLVideoElement).currentTime)}
          onEnded={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-20 w-20 rounded-full bg-white/90 text-black flex items-center justify-center shadow-2xl">
              <Play className="h-9 w-9 fill-current ml-1.5" />
            </div>
          </div>
        )}
      </button>

      {/* Controls */}
      <div className="px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 bg-gradient-to-t from-black to-transparent">
        {/* Scrubber */}
        <input
          type="range"
          min={0}
          max={100}
          value={pct}
          onChange={onScrub}
          aria-label="Seek"
          className="w-full accent-primary h-1 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-white/60 mt-1">
          <span>{fmt(current)}</span>
          <span>{fmt(duration)}</span>
        </div>

        {/* Transport */}
        <div className="flex items-center justify-between mt-3">
          <button onClick={() => { const a = document.createElement("a"); a.href = videoUrl; a.download = `${title || "dream"}.mp4`; a.target = "_blank"; a.click(); }} className="text-white/70 hover:text-white p-2" aria-label="Download">
            <Download className="h-5 w-5" />
          </button>
          <button onClick={() => seekBy(-10)} className="text-white/80 hover:text-white p-2" aria-label="Back 10 seconds">
            <SkipBack className="h-6 w-6" />
          </button>
          <button onClick={togglePlay} className="h-14 w-14 rounded-full bg-white text-black flex items-center justify-center" aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause className="h-7 w-7 fill-current" /> : <Play className="h-7 w-7 fill-current ml-0.5" />}
          </button>
          <button onClick={() => seekBy(10)} className="text-white/80 hover:text-white p-2" aria-label="Forward 10 seconds">
            <SkipForward className="h-6 w-6" />
          </button>
          <button onClick={share} className="text-white/70 hover:text-white p-2" aria-label="Share">
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        <div className="flex justify-end mt-2">
          <button onClick={fullscreen} className="text-white/60 hover:text-white p-1" aria-label="Fullscreen">
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CinematicPlayer;
