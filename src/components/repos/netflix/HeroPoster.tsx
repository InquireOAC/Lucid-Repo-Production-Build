import React from "react";
import { useNavigate } from "react-router-dom";
import { DreamEntry } from "@/types/dream";
import { Play, Plus, Check, Info, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  dream: DreamEntry;
  inList: boolean;
  onToggleList: (id: string) => void;
}

const HeroPoster: React.FC<Props> = ({ dream, inList, onToggleList }) => {
  const navigate = useNavigate();
  const imageUrl = dream.generatedImage || dream.image_url;
  const tag = dream.tags?.[0] || (dream.lucid ? "Lucid" : "Dream");

  const open = () => {
    const from = window.location.pathname + window.location.search;
    navigate(`/lucid-repo/${dream.id}?from=${encodeURIComponent(from)}`);
  };

  return (
    <div className="relative -mx-4 sm:-mx-6 md:mx-0 mb-6 lg:mb-10 md:rounded-2xl overflow-hidden stable-card lg:max-h-[480px] xl:max-h-[560px]">
      <div
        className="relative aspect-[3/4] md:aspect-[21/9] cursor-pointer lg:max-h-[480px] xl:max-h-[560px]"
        onClick={open}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={dream.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center">
            <Moon className="h-20 w-20 text-white/60" />
          </div>
        )}
        {/* Top fade for status bar */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/80 to-transparent pointer-events-none" />
        {/* Bottom fade into page */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/70 to-transparent pointer-events-none" />
      </div>

      {/* Hero content, sits on top of bottom fade */}
      <div className="absolute inset-x-0 bottom-0 px-5 pb-5 pt-10 lg:px-10 lg:pb-10 xl:px-14 xl:pb-14 z-10">
        <div className="flex items-center justify-center gap-2 mb-3 text-[11px] lg:text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
          <span className="text-primary">●</span>
          <span>Top Pick Today</span>
          <span className="text-primary">●</span>
        </div>
        <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white text-center leading-tight line-clamp-2 mb-2 lg:mb-3">
          {dream.title}
        </h1>
        <div className="flex items-center justify-center gap-2 text-xs lg:text-sm text-white/70 mb-4 lg:mb-6">
          <span className="uppercase tracking-wider">{tag}</span>
          {dream.lucid && <><span>•</span><span>Lucid</span></>}
          <span>•</span>
          <span>{dream.like_count || 0} likes</span>
        </div>

        <div className="flex items-center justify-center gap-2 lg:gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleList(dream.id); }}
            className="flex flex-col items-center gap-1 px-3 py-1 text-white/90 hover:text-white"
          >
            {inList ? <Check className="h-6 w-6 lg:h-7 lg:w-7" /> : <Plus className="h-6 w-6 lg:h-7 lg:w-7" />}
            <span className="text-[10px] lg:text-xs uppercase tracking-wider">My List</span>
          </button>
          <button
            onClick={open}
            className="flex items-center gap-2 px-7 py-2.5 lg:px-9 lg:py-3 lg:text-lg rounded-md bg-white text-black font-bold hover:bg-white/90 transition-colors"
          >
            <Play className="h-5 w-5 lg:h-6 lg:w-6 fill-current" />
            Read
          </button>
          <button
            onClick={open}
            className="flex flex-col items-center gap-1 px-3 py-1 text-white/90 hover:text-white"
          >
            <Info className="h-6 w-6 lg:h-7 lg:w-7" />
            <span className="text-[10px] lg:text-xs uppercase tracking-wider">Info</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroPoster;