
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Loader2, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface DreamCommentsProps {
  dreamId: string;
  onCommentCountChange: (count: number) => void;
}

const DreamComments = ({ dreamId, onCommentCountChange }: DreamCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
    // This ensures the counter refreshes on mount
    // eslint-disable-next-line
  }, [dreamId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("dream_comments")
        .select("*, profiles:user_id(username, display_name, avatar_url)")
        .eq("dream_id", dreamId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setComments(data || []);
      // Update comment count *after fetching*
      onCommentCountChange((data?.length || 0));
    } catch (error) {
      console.error("Error fetching comments:", error);
      onCommentCountChange(0); // Defensive: set to 0 on error/fetch fail
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
        .select("*, profiles:user_id(username, display_name, avatar_url)")
        .single();

      if (error) throw error;

      // Optimistically update local comment state/counter
      setComments([...comments, data]);
      setNewComment("");
      // Trigger a refetch (so triggers update count too)
      fetchComments();
    } catch (error: any) {
      toast.error("Failed to post comment: " + (error?.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Comments</h3>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-dream-purple" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={comment.profiles?.avatar_url}
                  alt={comment.profiles?.username || "User"}
                />
                <AvatarFallback>
                  {(comment.profiles?.username?.[0] || "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex gap-2 items-baseline">
                  <p className="font-medium text-sm">
                    {comment.profiles?.display_name ||
                      comment.profiles?.username ||
                      "Anonymous"}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(comment.created_at), "MMM d, h:mm a")}
                  </span>
                </div>
                <p className="mt-1 text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">
          No comments yet. Be the first to comment!
        </p>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2 items-center mt-4">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage
              src={user.user_metadata?.avatar_url}
              alt={user.user_metadata?.username || "User"}
            />
            <AvatarFallback>
              {(user.user_metadata?.username?.[0] || "U").toUpperCase()}
            </AvatarFallback>
          </Avatar>
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
