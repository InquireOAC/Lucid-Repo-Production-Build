
import React, { useState } from "react";
import { useDreamComments } from "@/hooks/useDreamComments";
import { Button } from "@/components/ui/button";
import SymbolAvatar from "@/components/profile/SymbolAvatar";
import FlagButton from "@/components/moderation/FlagButton";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import { containsInappropriateContent, getContentWarningMessage } from "@/utils/contentFilter";
import { toast } from "sonner";

export default function DreamCommentSection({ dreamId, user }) {
  const { comments, addComment, deleteComment, isLoading } = useDreamComments(dreamId);
  const { isUserBlocked } = useBlockedUsers();
  const [commentText, setCommentText] = useState("");

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;

    // Check for inappropriate content
    if (containsInappropriateContent(commentText)) {
      toast.error(getContentWarningMessage());
      return;
    }

    await addComment(user, commentText);
    setCommentText("");
  };

  // Filter out comments from blocked users
  const visibleComments = comments?.filter(comment => 
    !isUserBlocked(comment.user_id)
  ) || [];

  return (
    <div>
      <h4 className="font-bold mb-2">Comments</h4>
      {user && (
        <form
          onSubmit={handleSubmitComment}
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
        {visibleComments.map(c => (
          <div key={c.id} className="flex gap-2 items-start">
            <SymbolAvatar
              symbol={c.profiles?.avatar_symbol}
              color={c.profiles?.avatar_color}
              avatarUrl={c.profiles?.avatar_url || c.profiles?.profile_picture}
              fallbackLetter={(c.profiles?.username || "U")[0].toUpperCase()}
              size={24}
            />
            <div className="flex-1">
              <div className="flex gap-2 items-center">
                <span className="font-semibold text-xs">{c.profiles?.username}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleString()}</span>
                {user && user.id !== c.user_id && (
                  <FlagButton
                    contentType="comment"
                    contentId={c.id}
                    contentOwnerId={c.user_id}
                    size="sm"
                  />
                )}
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
