import React, { useState } from "react";
import { useVideoComments } from "@/hooks/useVideoComments";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import FlagButton from "@/components/moderation/FlagButton";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import { containsInappropriateContent, getContentWarningMessage } from "@/utils/contentFilter";
import { toast } from "sonner";

export default function VideoCommentSection({ videoId, user }) {
  const { comments, addComment, deleteComment, isLoading } = useVideoComments(videoId);
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
      <h4 className="font-bold mb-2 text-white">Comments</h4>
      {user && (
        <form
          onSubmit={handleSubmitComment}
          className="flex gap-2 mb-2"
        >
          <input
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            className="border p-2 flex-1 rounded text-sm bg-white/10 border-white/20 text-white placeholder-white/50"
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
            <Avatar className="h-6 w-6">
              <AvatarImage src={c.profiles?.profile_picture} />
            </Avatar>
            <div className="flex-1">
              <div className="flex gap-2 items-center">
                <span className="font-semibold text-xs text-white">{c.profiles?.username}</span>
                <span className="text-[10px] text-white/50">{new Date(c.created_at).toLocaleString()}</span>
                {user && user.id !== c.user_id && (
                  <FlagButton
                    contentType="video_comment"
                    contentId={c.id}
                    contentOwnerId={c.user_id}
                    size="sm"
                  />
                )}
                {user?.id === c.user_id && (
                  <button 
                    className="text-red-400 text-xs ml-2 hover:text-red-300 transition-colors" 
                    onClick={() => deleteComment(c.id, user)}
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="text-xs text-white/80">{c.comment_text}</div>
            </div>
          </div>
        ))}
        {isLoading && <div className="text-xs text-white/50">Loading...</div>}
      </div>
    </div>
  );
}