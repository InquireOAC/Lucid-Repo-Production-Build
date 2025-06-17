import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Loader2, Send, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SymbolAvatar from "@/components/profile/SymbolAvatar";
import { useNavigate } from "react-router-dom";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    username?: string;
    display_name?: string;
    avatar_symbol?: string;
    avatar_color?: string;
  };
}

interface DreamCommentsProps {
  dreamId: string;
  onCommentCountChange: (count: number) => void;
}

const DreamComments = ({ dreamId, onCommentCountChange }: DreamCommentsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [dreamId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("dream_comments")
        .select("*, profiles:user_id(username, display_name, avatar_symbol, avatar_color)")
        .eq("dream_id", dreamId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setComments(data || []);
      onCommentCountChange((data?.length || 0));
    } catch (error) {
      console.error("Error fetching comments:", error);
      onCommentCountChange(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You need to sign in to comment");
      return;
    }
    if (!newComment.trim()) return;
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("dream_comments")
        .insert([
          {
            dream_id: dreamId,
            user_id: user.id,
            content: newComment.trim(),
          },
        ])
        .select("*, profiles:user_id(username, display_name, avatar_symbol, avatar_color)")
        .single();

      if (error) throw error;

      setComments([...comments, data]);
      setNewComment("");
      fetchComments();
    } catch (error: any) {
      toast.error("Failed to post comment: " + (error?.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    
    setDeletingCommentId(commentId);
    try {
      const { error } = await supabase
        .from("dream_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Update local state
      setComments(comments.filter(comment => comment.id !== commentId));
      onCommentCountChange(comments.length - 1);
      toast.success("Comment deleted");
    } catch (error: any) {
      toast.error("Failed to delete comment: " + (error?.message || "Unknown error"));
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleUserClick = (username?: string) => {
    if (username && username.trim() !== "" && username !== "Anonymous User") {
      navigate(`/profile/${username}`);
    }
  };

  return (
    <div className="space-y-4" data-comments-section>
      <h3 className="font-medium text-lg">Comments</h3>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-dream-purple" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => {
            // Use SymbolAvatar and fallback logic
            const profile = comment.profiles;
            const displayName = profile?.display_name ?? profile?.username ?? "";
            const fallbackLetter = displayName?.[0]?.toUpperCase() ?? "U";
            const username = profile?.username;
            const isOwnComment = user?.id === comment.user_id;
            
            return (
              <div key={comment.id} className="flex gap-3">
                <div 
                  className="cursor-pointer"
                  onClick={() => handleUserClick(username)}
                >
                  <SymbolAvatar
                    symbol={profile?.avatar_symbol}
                    color={profile?.avatar_color}
                    fallbackLetter={fallbackLetter}
                    size={32}
                    className="h-8 w-8"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex gap-2 items-baseline">
                    <p 
                      className="font-medium text-sm cursor-pointer hover:underline"
                      onClick={() => handleUserClick(username)}
                    >
                      {displayName || "Anonymous"}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.created_at), "MMM d, h:mm a")}
                    </span>
                    {isOwnComment && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingCommentId === comment.id}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        {deletingCommentId === comment.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                  <p className="mt-1 text-sm">{comment.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">
          No comments yet. Be the first to comment!
        </p>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2 items-center mt-4">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            disabled={isSubmitting || !newComment.trim()}
            className="text-dream-purple hover:bg-dream-purple/10"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Sign in to leave a comment
        </p>
      )}
    </div>
  );
};

export default DreamComments;
