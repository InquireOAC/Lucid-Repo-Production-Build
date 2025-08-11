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
const SharedDreamCard = ({
  dreamId,
  className = ""
}: SharedDreamCardProps) => {
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
      const {
        data: dreamData,
        error: dreamError
      } = await supabase.from("dream_entries").select("*").eq("id", dreamId).single();
      if (dreamError) throw dreamError;

      // Fetch profile data
      const {
        data: profileData,
        error: profileError
      } = await supabase.from("profiles").select("id, username, display_name, avatar_url, avatar_symbol, avatar_color").eq("id", dreamData.user_id).single();
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
    return <div className={`glass-card rounded-xl p-6 border border-white/10 backdrop-blur-xl animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-white/20 rounded-lg"></div>
              <div className="h-3 bg-white/10 rounded-lg w-1/2"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-5 bg-white/20 rounded-lg w-3/4"></div>
            <div className="h-32 bg-white/10 rounded-lg"></div>
            <div className="h-3 bg-white/10 rounded-lg"></div>
            <div className="h-3 bg-white/10 rounded-lg w-2/3"></div>
          </div>
        </div>
      </div>;
  }
  if (!dream || !profile) {
    return <div className={`glass-card rounded-xl p-6 border border-white/10 backdrop-blur-xl ${className}`}>
        <div className="text-center text-white/70 py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full mx-auto mb-3 flex items-center justify-center">
            <Eye className="h-6 w-6 text-white/50" />
          </div>
          <p className="text-lg font-medium mb-1">Dream not found</p>
          <p className="text-sm text-white/50">This dream is no longer accessible</p>
        </div>
      </div>;
  }
  const contentPreview = dream.content.length > 200 && !expanded ? dream.content.substring(0, 200) + "..." : dream.content;
  return <div className={`glass-card rounded-xl p-6 border border-white/10 backdrop-blur-xl hover:border-purple-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 ${className}`}>
      {/* Header with profile info */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={handleViewProfile} className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 group">
          
          <div className="text-left">
            <p className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
              {profile.display_name || profile.username}
            </p>
            <p className="text-xs text-white/60">shared a dream</p>
          </div>
        </button>
        
        {dream.is_public && <Button size="sm" variant="ghost" onClick={handleViewFullDream} className="w-8 h-8 p-0 rounded-full glass-card border border-white/10 hover:border-purple-400/30 hover:bg-purple-500/20 text-white/70 hover:text-white transition-all duration-200">
            <ExternalLink className="h-4 w-4" />
          </Button>}
      </div>

      {/* Dream content */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white/95 leading-tight">{dream.title}</h3>
        
        {dream.image_url && <div className="rounded-lg overflow-hidden border border-white/10">
            <img src={dream.image_url} alt="Dream visualization" className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300" />
          </div>}

        <div className="text-sm text-white/80 leading-relaxed">
          <p className="whitespace-pre-wrap">{contentPreview}</p>
          {dream.content.length > 200 && <button onClick={() => setExpanded(!expanded)} className="mt-2 text-purple-300 hover:text-purple-200 transition-colors font-medium text-xs uppercase tracking-wide">
              {expanded ? "Show less" : "Read more"}
            </button>}
        </div>

        {/* Tags */}
        {dream.tags.length > 0 && <div className="flex flex-wrap gap-2">
            {dream.tags.map((tag, index) => <span key={index} className="text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-200">
                <Tag className="h-3 w-3" />
                {tag}
              </span>)}
          </div>}

        {/* Metadata Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-4 text-xs text-white/60">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(dream.date).toLocaleDateString()}</span>
            </div>
            {dream.mood && <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
                <span className="capitalize">{dream.mood}</span>
              </div>}
          </div>
        </div>
      </div>
    </div>;
};
export default SharedDreamCard;