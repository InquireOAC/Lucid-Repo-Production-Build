
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DreamCommentsProps {
  dreamId: string;
  onCommentCountChange?: (count: number) => void;
}

const DreamComments = ({ dreamId, onCommentCountChange }: DreamCommentsProps) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userProfiles, setUserProfiles] = useState<{[key: string]: any}>({});
  
  useEffect(() => {
    fetchComments();
  }, [dreamId]);
  
  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("dream_comments")
        .select("*")
        .eq("dream_id", dreamId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setComments(data || []);
      
      // Update comment count
      if (onCommentCountChange) {
        onCommentCountChange(data?.length || 0);
      }
      
      // Get user profiles for comments
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(c => c.user_id))];
        fetchUserProfiles(userIds);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserProfiles = async (userIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);
      
      if (error) throw error;
      
      // Convert array to object with user_id as keys
      const profilesMap: {[key: string]: any} = {};
      data?.forEach(profile => {
        profilesMap[profile.id] = profile;
      });
      
      setUserProfiles(profilesMap);
    } catch (error) {
      console.error("Error fetching user profiles:", error);
    }
  };
  
  const handleSubmitComment = async () => {
    if (!user) return;
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from("dream_comments")
        .insert({
          dream_id: dreamId,
          user_id: user.id,
          content: commentText.trim()
        })
        .select();
      
      if (error) throw error;
      
      // Add our profile to the local profiles store if needed
      if (!userProfiles[user.id] && profile) {
        setUserProfiles(prev => ({
          ...prev,
          [user.id]: profile
        }));
      }
      
      if (data) {
        setComments([data[0], ...comments]);
        
        // Increment comment count
        if (onCommentCountChange) {
          onCommentCountChange(comments.length + 1);
        }
        
        // Update comment count in the database
        await supabase.rpc('increment_comment_count', { dream_id: dreamId });
      }
      
      setCommentText("");
      toast.success("Comment added!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-4 mt-2">
      <h3 className="text-lg font-medium">Comments</h3>
      
      {user ? (
        <div className="flex gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>
              {profile?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={2}
              className="resize-none"
            />
            <Button 
              onClick={handleSubmitComment} 
              disabled={submitting || !commentText.trim()}
              size="sm"
            >
              {submitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-center text-muted-foreground">
          Sign in to add comments
        </p>
      )}
      
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-sm text-muted-foreground">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No comments yet</p>
        ) : (
          comments.map((comment) => {
            const commentUser = userProfiles[comment.user_id];
            return (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-7 h-7">
                  <AvatarImage src={commentUser?.avatar_url} />
                  <AvatarFallback className="bg-dream-purple/20 text-xs">
                    {commentUser?.username?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm font-medium">
                      {commentUser?.display_name || commentUser?.username || "Anonymous"}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DreamComments;
