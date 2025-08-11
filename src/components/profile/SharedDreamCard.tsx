import React, { useState, useEffect } from "react";
import { Calendar, Tag, Heart, MessageCircle, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Dream {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  mood?: string;
  is_public: boolean;
  user_id: string;
  image_url?: string;
  like_count?: number;
  comment_count?: number;
  view_count?: number;
}

interface Profile {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  avatar_symbol?: string;
  avatar_color?: string;
}

interface SharedDreamCardProps {
  dreamId: string;
  className?: string;
}

const SharedDreamCard = ({ dreamId, className = "" }: SharedDreamCardProps) => {
  const [dream, setDream] = useState<Dream | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchDreamAndProfile();
  }, [dreamId]);

  const fetchDreamAndProfile = async () => {
    try {
      // Fetch dream data
      const { data: dreamData, error: dreamError } = await supabase
        .from("dream_entries")
        .select("*")
        .eq("id", dreamId)
        .single();

      if (dreamError) throw dreamError;

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, avatar_symbol, avatar_color")
        .eq("id", dreamData.user_id)
        .single();

      if (profileError) throw profileError;

      setDream(dreamData);
      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching shared dream:", error);
      toast.error("Failed to load shared dream");
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = () => {
    if (profile) {
      window.location.href = `/profile/${profile.username || profile.id}`;
    }
  };

  const handleViewFullDream = () => {
    if (dream?.is_public) {
      window.open(`/dream/${dream.id}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className={`glass-card rounded-xl p-4 border-white/10 animate-pulse ${className}`}>
        <div className="space-y-3">
          <div className="h-4 bg-white/10 rounded"></div>
          <div className="h-3 bg-white/10 rounded w-3/4"></div>
          <div className="h-3 bg-white/10 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!dream || !profile) {
    return (
      <div className={`glass-card rounded-xl p-4 border-white/10 ${className}`}>
        <div className="text-center text-white/70">
          <p>Dream not found or no longer accessible</p>
        </div>
      </div>
    );
  }

  const contentPreview = dream.content.length > 200 && !expanded 
    ? dream.content.substring(0, 200) + "..." 
    : dream.content;

  return (
    <div className={`glass-card rounded-xl p-4 border-white/10 hover:border-white/20 transition-all ${className}`}>
      {/* Header with profile info */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handleViewProfile}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full flex items-center justify-center">
            <span className="text-white/80 font-medium text-xs">
              {(profile.display_name || profile.username)?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white/90">
              {profile.display_name || profile.username}
            </p>
            <p className="text-xs text-white/60">shared a dream</p>
          </div>
        </button>
        
        {dream.is_public && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleViewFullDream}
            className="hover:bg-white/10 text-white/70"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Dream content */}
      <div className="space-y-3">
        <h3 className="font-semibold text-white/90">{dream.title}</h3>
        
        {dream.image_url && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={dream.image_url}
              alt="Dream visualization"
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        <div className="text-sm text-white/80 leading-relaxed">
          {contentPreview}
          {dream.content.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-2 text-purple-300 hover:text-purple-200 transition-colors"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>

        {/* Tags */}
        {dream.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {dream.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full flex items-center gap-1"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs text-white/50 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(dream.date).toLocaleDateString()}
          </div>
          {dream.mood && (
            <span className="capitalize">{dream.mood}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedDreamCard;