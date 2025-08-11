import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Heart, Calendar } from "lucide-react";
import { VideoEntry } from "@/types/video";
import { useAuth } from "@/contexts/AuthContext";
import VideoCommentSection from "./VideoCommentSection";
const extractYouTubeId = (url: string): string => {
  const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/, /youtube\.com\/v\/([^&\n?#]+)/];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return '';
};
interface VideoDetailProps {
  video: VideoEntry;
  isOpen: boolean;
  onClose: () => void;
}
const VideoDetail = ({
  video,
  isOpen,
  onClose
}: VideoDetailProps) => {
  const { user } = useAuth();
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-white/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white gradient-text">
            {video.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* YouTube Video Player */}
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {video.video_url ? <iframe src={`https://www.youtube.com/embed/${extractYouTubeId(video.video_url)}`} title={video.title} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dream-purple to-dream-pink">
                <p className="text-white">Video not available</p>
              </div>}
          </div>

          {/* Video Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dream-pink font-medium text-center">
                  {video.dreamer_story_name}
                </p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-white/70">
                <div className="flex items-center gap-1">
                  
                  <span className="text-center">{video.view_count || 0} views</span>
                </div>
                <div className="flex items-center gap-1">
                  
                  <span className="text-center">{video.like_count || 0} likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(video.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="glass-card p-4 rounded-lg border-white/10">
              <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                {video.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" className="glass-button">
                <Heart className="w-4 h-4 mr-2" />
                Like
              </Button>
              <Button variant="outline" className="glass-button">
                Share
              </Button>
            </div>

            {/* Comments Section */}
            <div className="glass-card p-4 rounded-lg border-white/10">
              <VideoCommentSection videoId={video.id} user={user} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};
export default VideoDetail;