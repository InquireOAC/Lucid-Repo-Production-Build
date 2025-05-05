
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DreamCommentsProps {
  dreamId: string;
  onCommentCountChange: (count: number) => void;
}

interface Comment {
  id: string;
  created_at: string;
  content: string;
  user_id: string;
  dream_id: string;
  profiles?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

const DreamComments = ({ dreamId, onCommentCountChange }: DreamCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [dreamId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("dream_comments")
        .select("*, profiles:user_id(username, display_name, avatar_url)")
        .eq("dream_id", dreamId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setComments(data || []);
      onCommentCountChange(data?.length || 0);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be signed in to comment");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);

      // Insert the comment
      const { data, error } = await supabase
        .from("dream_comments")
        .insert({
          user_id: user.id,
          dream_id: dreamId,
          content: newComment
        })
        .select("*, profiles:user_id(username, display_name, avatar_url)")
        .single();

      if (error) throw error;

      // Update comment count using custom SQL function instead of RPC
      // Note: We'll create this function in the SQL migration
      const { error: updateError } = await supabase
        .from("dream_entries")
        .update({ comment_count: comments.length + 1 })
        .eq("id", dreamId);

      if (updateError) throw updateError;

      setComments(prev => [...prev, data]);
      setNewComment("");
      onCommentCountChange(comments.length + 1);
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Comments ({comments.length})</h3>
      
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-dream-purple" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.profiles?.avatar_url} alt={comment.profiles?.username || "User"} />
                <AvatarFallback>
                  {(comment.profiles?.username || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-secondary/30 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-sm">
                    {comment.profiles?.display_name || comment.profiles?.username || "Anonymous"}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(comment.created_at), "MMM d, h:mm a")}
                  </span>
                </div>
                <p className="text-sm mt-1">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-4">No comments yet. Be the first to comment!</p>
      )}

      {user && (
        <form onSubmit={handleSubmitComment} className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting || !newComment.trim()}
              className="bg-dream-purple hover:bg-dream-purple/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Comment"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DreamComments;
