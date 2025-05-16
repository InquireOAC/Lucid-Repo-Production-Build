
import React, { useState } from "react";
import { useRepoSearch } from "@/hooks/useRepoSearch";
import DreamCard from "./DreamCard";
import { useDreamLikes } from "@/hooks/useDreamLikes";
import { useAuth } from "@/contexts/AuthContext";

export default function RepoSearch() {
  const [query, setQuery] = useState("");
  const { dreams, isLoading } = useRepoSearch(query);
  const { user } = useAuth();

  return (
    <div>
      <form
        onSubmit={e => { e.preventDefault(); }}
        className="mb-4"
      >
        <input
          className="border p-2 rounded w-full"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by username, tag, or keyword"
        />
      </form>
      {isLoading && <div>Searching...</div>}
      {dreams.map((dream) => {
        const { liked, handleLikeToggle } = useDreamLikes(user, dream);
        return (
          <DreamCard
            key={dream.id}
            dream={dream}
            liked={liked}
            onLike={handleLikeToggle}
            onComment={() => {}}
            onCardClick={() => {}}
          />
        );
      })}
    </div>
  );
}
