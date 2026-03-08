import React from "react";
import { DreamSeries } from "@/hooks/useDreamSeries";
import { Eye, BookOpen } from "lucide-react";
import SymbolAvatar from "@/components/profile/SymbolAvatar";

interface DiscoverySeriesCardProps {
  series: DreamSeries;
  onClick: (series: DreamSeries) => void;
}

const DiscoverySeriesCard: React.FC<DiscoverySeriesCardProps> = ({ series, onClick }) => {
  const profile = series.profiles || {} as any;
  const displayName = profile.display_name || profile.username || "Anonymous";

  return (
    <div
      className="flex-shrink-0 w-[140px] cursor-pointer group"
      onClick={() => onClick(series)}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted/30 mb-2">
        {series.cover_image_url ? (
          <img
            src={series.cover_image_url}
            alt={series.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 p-3">
            <BookOpen className="h-8 w-8 text-primary/60 mb-2" />
            <span className="text-xs text-center text-foreground/70 font-medium line-clamp-3">{series.title}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <h3 className="text-xs font-semibold text-white line-clamp-2 leading-tight mb-1">
            {series.title}
          </h3>
          <div className="flex items-center gap-2 text-white/70">
            <span className="flex items-center gap-0.5 text-[10px]">
              <BookOpen className="h-2.5 w-2.5" />
              {series.chapter_count} ch.
            </span>
            <span className="flex items-center gap-0.5 text-[10px]">
              <Eye className="h-2.5 w-2.5" />
              {series.view_count || 0}
            </span>
          </div>
        </div>

        {series.status !== "ongoing" && (
          <div className="absolute top-1.5 left-1.5">
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary/90 text-primary-foreground uppercase">
              {series.status}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <SymbolAvatar
          symbol={profile.avatar_symbol}
          color={profile.avatar_color}
          avatarUrl={profile.avatar_url}
          fallbackLetter={displayName[0]?.toUpperCase() || "?"}
          size={20}
        />
        <span className="text-[11px] text-muted-foreground truncate">{displayName}</span>
      </div>
    </div>
  );
};

export default DiscoverySeriesCard;
