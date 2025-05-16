
import React from "react";
import DreamCard from "./DreamCard";
import { useDreamLikes } from "@/hooks/useDreamLikes";

export default function ProfileDreamList({ dreams, user, refreshLikedDreams }) {
  return (
    <div>
      {dreams.map((dream) => {
        const { likeCount, liked, handleLikeToggle } = useDreamLikes(user, dream);
        // Wrap handleLikeToggle to also trigger parent refresh
        const wrappedLikeToggle = async () => {
          await handleLikeToggle();
          if (refreshLikedDreams) refreshLikedDreams();
        };
        return (
          <DreamCard
            key={dream.id}
            dream={dream}
            likeCount={likeCount}
            liked={liked}
            onLike={wrappedLikeToggle}
            commentCount={dream.comment_count || 0}
            onComment={() => {}}
            onCardClick={() => {}}
          />
        );
      })}
    </div>
  );
}
