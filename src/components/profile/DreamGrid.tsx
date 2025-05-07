
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DreamDetail from "@/components/DreamDetail";

interface DreamGridProps {
  dreams: any[];
  isLiked?: boolean;
  isOwnProfile: boolean;
  emptyTitle: string;
  emptyMessage: {
    own: string;
    other: string;
  };
  emptyIcon: React.ReactNode;
  actionLink: string;
  actionText: string;
}

const DreamGrid = ({
  dreams,
  isLiked = false,
  isOwnProfile,
  emptyTitle,
  emptyMessage,
  emptyIcon,
  actionLink,
  actionText,
}: DreamGridProps) => {
  const [selectedDream, setSelectedDream] = useState<any>(null);
  // Track which dream audio is playing
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Handle audio toggle for dream detail
  const handleToggleAudio = () => {
    if (playingAudioId) {
      setPlayingAudioId(null);
    } else if (selectedDream) {
      setPlayingAudioId(selectedDream.id);
    }
  };

  // When closing dream detail, stop audio playback
  const handleCloseDream = () => {
    setPlayingAudioId(null);
    setSelectedDream(null);
  };

  if (dreams.length === 0) {
    return (
      <div className="text-center py-12">
        {emptyIcon}
        <h3 className="text-lg font-medium mb-1">{emptyTitle}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {isOwnProfile ? emptyMessage.own : emptyMessage.other}
        </p>
        <Link to={actionLink}>
          <Button variant="outline">{actionText}</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {dreams.map((dream: any) => {
          // Check for audio URL
          const hasAudio = !!(dream.audioUrl || dream.audio_url);
          
          return (
            <Card 
              key={dream.id} 
              className="overflow-hidden cursor-pointer hover:shadow-md transition-all"
              onClick={() => setSelectedDream(dream)}
            >
              <CardContent className="p-0">
                {dream.generatedImage ? (
                  <img 
                    src={dream.generatedImage} 
                    alt={dream.title}
                    className="aspect-square object-cover w-full"
                  />
                ) : (
                  <div className="aspect-square flex items-center justify-center bg-dream-purple/10">
                    <Moon size={32} className="text-dream-purple opacity-50" />
                  </div>
                )}
                <div className="p-2">
                  <p className="text-sm font-semibold truncate">{dream.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    {isLiked ? (
                      <div className="flex items-center gap-1">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={dream.profiles?.avatar_url} />
                          <AvatarFallback className="bg-dream-purple/20 text-[8px]">
                            {dream.profiles?.username?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground truncate max-w-[70px]">
                          {dream.profiles?.display_name || dream.profiles?.username || "User"}
                        </span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {new Date(dream.created_at).toLocaleDateString()}
                      </Badge>
                    )}
                    
                    {!isLiked && (
                      <div className="flex items-center text-muted-foreground">
                        <Heart size={12} className="mr-1" />
                        <span className="text-xs">{dream.like_count || 0}</span>
                      </div>
                    )}
                    
                    {isLiked && (
                      <Badge variant="outline" className="text-xs">
                        {new Date(dream.created_at).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedDream && (
        <DreamDetail
          dream={selectedDream}
          tags={[]} // Pass tags if available
          onClose={handleCloseDream}
          onUpdate={() => {}} // Implement if needed
          onDelete={() => {}} // Implement if needed
          isAuthenticated={true}
        />
      )}
    </>
  );
};

export default DreamGrid;
