import React, { useState } from "react";
import { PlayCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VideoThumbnailCardProps {
  video: {
    title: string;
    thumbnail_url?: string | null;
    youtube_url: string;
    youtube_id: string;
    duration: string;
    author: string;
  };
}

const VideoThumbnailCard: React.FC<VideoThumbnailCardProps> = ({ video }) => {
  const [imgError, setImgError] = useState(false);
  const thumbSrc = imgError
    ? `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`
    : (video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`);

  return (
    <div
      onClick={() => window.open(video.youtube_url, "_blank")}
      className="glass-card rounded-xl overflow-hidden cursor-pointer group shrink-0 w-[200px]"
    >
      <div className="relative aspect-video">
        <img
          src={thumbSrc}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => !imgError && setImgError(true)}
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
