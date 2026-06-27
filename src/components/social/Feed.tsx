
import React from "react";
import { useFeedPublicDreams } from "@/hooks/useFeedPublicDreams";
import DreamCard from "./DreamCard";
import { useAuth } from "@/contexts/AuthContext";
import { useDreamLikes } from "@/hooks/useDreamLikes";

export default function Feed() {
  const { user } = useAuth();
  const { dreams, isLoading, error } = useFeedPublicDreams(user);

  if (isLoading) return <div>Loading feed...</div>;
  if (error)
    return (
      <div className="text-sm text-muted-foreground">
        Couldn't load your feed.{" "}
        <button
          onClick={() => window.location.reload()}
          className="text-primary underline underline-offset-2"
        >
          Retry
        </button>
      </div>
    );
  if (!dreams.length) return <div>No dreams from people you follow yet.</div>;

  return (
    <div>
      {dreams.map((dream) => {
        const { liked, handleLikeToggle } = useDreamLikes(user, dream);
        return (
          <DreamCard
            key={dream.id}
            dream={dream}
            onLike={handleLikeToggle}
            liked={liked}
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
