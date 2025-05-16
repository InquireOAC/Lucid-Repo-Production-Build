
import React from "react";
import DreamCard from "./DreamCard";
import { useDreamLikes } from "@/hooks/useDreamLikes";

export default function ProfileDreamList({ dreams, user, refreshLikedDreams }) {
  return (
    <div>
      {dreams.map((dream) => {
        const { liked, handleLikeToggle } = useDreamLikes(user, dream);
        // Wrap handleLikeToggle to also trigger parent refresh
        const wrappedLikeToggle = async () => {
          await handleLikeToggle();
          if (refreshLikedDreams) refreshLikedDreams();
        };
        return (
          <DreamCard
            key={dream.id}
            dream={dream}
            liked={liked}
            onLike={wrappedLikeToggle}
            onComment={() => {}}
            onCardClick={() => {}}
          />
        );
      })}
    </div>
  );
}
