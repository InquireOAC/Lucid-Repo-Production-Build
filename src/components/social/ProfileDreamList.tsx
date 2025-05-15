import React from "react";
import DreamCard from "./DreamCard";
import { useAuth } from "@/contexts/AuthContext";
import { useDreamLikes } from "@/hooks/useDreamLikes";

export default function ProfileDreamList({ dreams, user }) {
  return (
    <div>
      {dreams.map((dream) => {
        const { likeCount, liked, handleLikeToggle } = useDreamLikes(user, dream);
        return (
          <DreamCard
            key={dream.id}
            dream={dream}
            likeCount={likeCount}
            liked={liked}
            onLike={handleLikeToggle}
            commentCount={dream.comment_count || 0}
            onComment={() => {}}
            onCardClick={() => {}}
          />
        );
      })}
    </div>
  );
}
