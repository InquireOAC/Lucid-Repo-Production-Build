import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Eye, Heart } from "lucide-react";
import { VideoEntry } from "@/types/video";

interface VideoCardProps {
  video: VideoEntry;
  onCardClick: () => void;
}

const VideoCard = ({ video, onCardClick }: VideoCardProps) => {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card 
      className="glass-card cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
      onClick={onCardClick}
    >
      <CardContent className="p-0">
        <div className="relative">
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="w-full h-48 object-cover rounded-t-xl"
            />
          ) : (
            <div className="w-full h-48 bg-[hsl(270,40%,15%)] rounded-t-xl flex items-center justify-center">
              <PlayCircle className="w-16 h-16 text-white/80" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors rounded-t-xl" />
          
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-black/60 text-white">
              {formatDuration(video.duration)}
            </Badge>
          </div>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-white line-clamp-2 group-hover:text-white/80 transition-colors">
              {video.title}
            </h3>
            <p className="text-sm text-white/70 mt-1">
              {video.dreamer_story_name}
            </p>
          </div>

          <p className="text-sm text-white/60 line-clamp-2">
            {video.description}
          </p>

          <div className="flex items-center justify-between text-xs text-white/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{video.view_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{video.like_count || 0}</span>
              </div>
            </div>
            <span>{new Date(video.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCard;