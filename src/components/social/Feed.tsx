
import React from "react";
import { useFeedPublicDreams } from "@/hooks/useFeedPublicDreams";
import DreamCard from "./DreamCard";
import { useAuth } from "@/contexts/AuthContext";
import { useDreamLikes } from "@/hooks/useDreamLikes";

export default function Feed() {
  const { user } = useAuth();
  const { dreams, isLoading } = useFeedPublicDreams(user);

  if (isLoading) return <div>Loading feed...</div>;
  if (!dreams.length) return <div>No dreams from people you follow yet.</div>;

  return (
    <div>
      {dreams.map((dream) => {
        const { likeCount, liked, handleLikeToggle } = useDreamLikes(user, dream);
        return (
          <DreamCard
            key={dream.id}
            dream={dream}
            onLike={handleLikeToggle}
            likeCount={likeCount}
            liked={liked}
            commentCount={dream.comment_count || 0}
            onComment={() => {}}
            onCardClick={() => {
              // Implement dream detail modal/view logic on click
            }}
          />
        );
      })}
    </div>
  );
}
