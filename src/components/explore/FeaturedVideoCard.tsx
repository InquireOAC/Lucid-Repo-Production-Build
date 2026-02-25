import React from "react";
import { PlayCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { VaultVideo } from "@/data/vaultContent";

interface FeaturedVideoCardProps {
  video: VaultVideo;
}

const FeaturedVideoCard: React.FC<FeaturedVideoCardProps> = ({ video }) => {
  return (
    <div
      onClick={() => window.open(video.youtubeUrl, "_blank")}
      className="glass-card vault-card-lift rounded-2xl overflow-hidden cursor-pointer group"
    >
      <div className="relative aspect-video">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayCircle className="w-14 h-14 text-white/80 group-hover:text-white group-hover:scale-110 transition-all duration-300 drop-shadow-lg" />
        </div>
        <div className="absolute bottom-3 right-3">
          <Badge variant="secondary" className="bg-black/60 text-white border-0">
            <Clock className="w-3 h-3 mr-1" />
            {video.duration}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
          {video.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{video.author}</p>
      </div>
    </div>
  );
};

export default FeaturedVideoCard;
