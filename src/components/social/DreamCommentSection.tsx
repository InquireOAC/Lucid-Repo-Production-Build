
import React, { useState } from "react";
import { useDreamComments } from "@/hooks/useDreamComments";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export default function DreamCommentSection({ dreamId, user }) {
  const { comments, addComment, deleteComment, isLoading } = useDreamComments(dreamId);
  const [commentText, setCommentText] = useState("");

  return (
    <div>
      <h4 className="font-bold mb-2">Comments</h4>
      {user && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addComment(user, commentText);
            setCommentText("");
          }}
          className="flex gap-2 mb-2"
        >
          <input
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            className="border p-2 flex-1 rounded text-sm"
            placeholder="Write a comment..."
          />
          <Button type="submit" size="sm" disabled={!commentText.trim()}>
            Post
          </Button>
        </form>
      )}
      <div className="space-y-3">
        {comments?.map(c => (
          <div key={c.id} className="flex gap-2 items-start">
            <Avatar className="h-6 w-6">
              <AvatarImage src={c.profiles?.profile_picture} />
            </Avatar>
            <div className="flex-1">
              <div className="flex gap-2 items-center">
                <span className="font-semibold text-xs">{c.profiles?.username}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleString()}</span>
                {user?.id === c.user_id && (
                  <button className="text-red-500 text-xs ml-2" onClick={() => deleteComment(c.id, user)}>
                    Delete
                  </button>
                )}
              </div>
              <div className="text-xs">{c.comment_text}</div>
            </div>
          </div>
        ))}
        {isLoading && <div className="text-xs text-muted-foreground">Loading...</div>}
      </div>
    </div>
  );
}
