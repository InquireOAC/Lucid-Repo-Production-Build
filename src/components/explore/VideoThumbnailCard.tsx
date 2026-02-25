import React from "react";
import { PlayCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { VaultVideo } from "@/data/vaultContent";

interface VideoThumbnailCardProps {
  video: VaultVideo;
}

const VideoThumbnailCard: React.FC<VideoThumbnailCardProps> = ({ video }) => {
  return (
    <div
      onClick={() => window.open(video.youtubeUrl, "_blank")}
      className="glass-card rounded-xl overflow-hidden cursor-pointer group shrink-0 w-[200px]"
    >
      <div className="relative aspect-video">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <PlayCircle className="w-8 h-8 text-white drop-shadow-lg" />
        </div>
        <div className="absolute bottom-1.5 right-1.5">
          <Badge variant="secondary" className="bg-black/60 text-white border-0 text-[10px] px-1.5 py-0">
            {video.duration}
          </Badge>
        </div>
      </div>
      <div className="p-2.5">
        <h4 className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">
          {video.title}
        </h4>
        <p className="text-[10px] text-muted-foreground mt-1">{video.author}</p>
      </div>
    </div>
  );
};

export default VideoThumbnailCard;
