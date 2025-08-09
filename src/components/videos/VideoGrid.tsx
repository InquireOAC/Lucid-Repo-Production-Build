import React from "react";
import { VideoEntry } from "@/types/video";
import VideoCard from "./VideoCard";

interface VideoGridProps {
  videos: VideoEntry[];
  onOpenVideo: (video: VideoEntry) => void;
}

const VideoGrid = ({ videos, onOpenVideo }: VideoGridProps) => {
  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">No videos available yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          onCardClick={() => onOpenVideo(video)}
        />
      ))}
    </div>
  );
};

export default VideoGrid;