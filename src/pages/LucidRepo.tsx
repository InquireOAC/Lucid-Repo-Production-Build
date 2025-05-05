
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Heart, MessageSquare, Share2, Moon, User, UserPlus, ChevronDown
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import DreamComments from "@/components/DreamComments";
import { DreamEntry } from "@/types/dream";

const LucidRepo = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [feedType, setFeedType] = useState<"public" | "following">("public");
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfiles, setUserProfiles] = useState<{[key: string]: any}>({});
  const [activeDream, setActiveDream] = useState<string | null>(null);
  const [activeComments, setActiveComments] = useState<string | null>(null);
  const [userLikes, setUserLikes] = useState<string[]>([]);
  
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    fetchDreams();
    fetchUserLikes();
  }, [user, feedType]);
  
  const fetchUserLikes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("dream_likes")
        .select("dream_id")
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      if (data) {
        const likedDreamIds = data.map(like => like.dream_id);
        setUserLikes(likedDreamIds);
      }
    } catch (error) {
      console.error("Error fetching user likes:", error);
    }
  };
  
  const fetchDreams = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("dream_entries")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      
      if (feedType === "following" && user) {
        // Get list of users that the current user follows
        const { data: followingData } = await supabase
          .from("followers")
          .select("following_id")
          .eq("follower_id", user.id);
        
        if (followingData && followingData.length > 0) {
          const followingIds = followingData.map(f => f.following_id);
          query = query.in("user_id", followingIds);
        } else {
          // If not following anyone, return empty array
          setDreams([]);
          setLoading(false);
          return;
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Update dreams with liked status and map field names for consistency
        const updatedDreams = data.map(dream => ({
          ...dream,
          liked: userLikes.includes(dream.id),
          isPublic: dream.is_public,
          likeCount: dream.like_count || 0,
          commentCount: dream.comment_count || 0
        }));
        setDreams(updatedDreams);
        
        // Fetch user profiles for these dreams
        const userIds = [...new Set(data.map(d => d.user_id))];
        fetchUserProfiles(userIds);
      } else {
        setDreams([]);
      }
    } catch (error) {
      console.error("Error fetching dreams:", error);
      toast.error("Failed to load dreams");
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
  
  const handleLike = async (dreamId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    try {
      // Check if already liked
      const isLiked = userLikes.includes(dreamId);
      
      if (isLiked) {
        // Unlike
        await supabase
          .from("dream_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("dream_id", dreamId);
        
        // Update dream like count
        await supabase
          .from("dream_entries")
          .update({ like_count: Math.max((dreams.find(d => d.id === dreamId)?.like_count || 1) - 1, 0) })
          .eq("id", dreamId);
          
        // Update local state
        setUserLikes(userLikes.filter(id => id !== dreamId));
      } else {
        // Like
        await supabase
          .from("dream_likes")
          .insert({ user_id: user.id, dream_id: dreamId });
        
        // Update dream like count
        await supabase
          .from("dream_entries")
          .update({ like_count: (dreams.find(d => d.id === dreamId)?.like_count || 0) + 1 })
          .eq("id", dreamId);
          
        // Update local state
        setUserLikes([...userLikes, dreamId]);
      }
      
      // Update dreams list with new like status
      setDreams(dreams.map(dream => {
        if (dream.id === dreamId) {
          return {
            ...dream,
            liked: !isLiked,
            like_count: isLiked 
              ? Math.max((dream.like_count || 1) - 1, 0)
              : (dream.like_count || 0) + 1,
            likeCount: isLiked 
              ? Math.max((dream.like_count || 1) - 1, 0)
              : (dream.like_count || 0) + 1
          };
        }
        return dream;
      }));
      
    } catch (error) {
      console.error("Error liking dream:", error);
      toast.error("Failed to like dream");
    }
  };
  
  const handleFollow = async (userId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (userId === user.id) {
      toast.error("You cannot follow yourself");
      return;
    }
    
    try {
      // Check if already following
      const { data: existingFollow } = await supabase
        .from("followers")
        .select("*")
        .eq("follower_id", user.id)
        .eq("following_id", userId)
        .single();
      
      if (existingFollow) {
        // Unfollow
        await supabase
          .from("followers")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId);
        
        toast.success("Unfollowed user");
      } else {
        // Follow
        await supabase
          .from("followers")
          .insert({ follower_id: user.id, following_id: userId });
        
        toast.success("Now following user");
      }
      
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to update follow status");
    }
  };
  
  const handleShare = (dream: any) => {
    // For a real iOS app, this would use the native sharing API
    // For web, we'll just copy a link to clipboard
    const shareText = `Check out this dream: ${dream.title}`;
    navigator.clipboard.writeText(shareText);
    toast.success("Link copied to clipboard!");
  };
  
  const toggleComments = (dreamId: string) => {
    if (activeComments === dreamId) {
      setActiveComments(null);
    } else {
      setActiveComments(dreamId);
    }
  };
  
  const navigateToProfile = (userId: string) => {
    if (userId === user?.id) {
      navigate("/profile");
    } else {
      // For viewing other users' profiles
      navigate(`/profile/${userId}`);
    }
  };
  
  if (!user) {
    return null; // Redirect happens above
  }
  
  if (loading) {
    return (
      <div className="min-h-screen dream-background flex items-center justify-center">
        <div className="text-center">
          <Moon size={48} className="mx-auto animate-pulse text-dream-purple" />
          <p className="mt-4">Loading dreams...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen dream-background">
      <div className="p-4">
        <h1 className="text-2xl font-bold gradient-text mb-4 text-center">
          Lucid Repo
        </h1>
        
        <Tabs 
          value={feedType} 
          onValueChange={(value: string) => setFeedType(value as "public" | "following")}
          className="w-full mb-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="public">Public</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {dreams.length === 0 ? (
          <div className="text-center py-12">
            <Moon size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-medium mb-2">No dreams found</h3>
            <p className="text-muted-foreground mb-6">
              {feedType === "public" 
                ? "Be the first to share your dream with the world!"
                : "Follow other dreamers to see their content here."}
            </p>
            <Button 
              variant="outline" 
              onClick={() => setFeedType(feedType === "public" ? "following" : "public")}
            >
              Switch to {feedType === "public" ? "Following" : "Public"} Feed
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {dreams.map((dream) => {
              const dreamUser = userProfiles[dream.user_id];
              
              return (
                <Card 
                  key={dream.id} 
                  className="overflow-hidden shadow-md"
                >
                  <div className="p-3 flex items-center justify-between">
                    <div 
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => dreamUser && navigateToProfile(dreamUser.id)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={dreamUser?.avatar_url} />
                        <AvatarFallback className="bg-dream-purple/20">
                          {dreamUser?.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {dreamUser?.display_name || dreamUser?.username || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(dream.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {dreamUser && dreamUser.id !== user.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2"
                        onClick={() => handleFollow(dreamUser.id)}
                      >
                        <UserPlus size={18} />
                      </Button>
                    )}
                  </div>
                  
                  <div className="relative">
                    <Carousel 
                      className="w-full" 
                      onMouseDown={() => setActiveDream(dream.id)}
                      onMouseUp={() => setActiveDream(null)}
                    >
                      <CarouselContent>
                        {/* Image Slide */}
                        <CarouselItem>
                          <div className="relative aspect-[4/3] w-full bg-dream-purple/5 flex items-center justify-center overflow-hidden">
                            {dream.generatedImage ? (
                              <img 
                                src={dream.generatedImage} 
                                alt={dream.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Moon size={48} className="text-dream-purple/40" />
                            )}
                            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
                              <h3 className="text-white font-bold text-lg drop-shadow-md">
                                {dream.title}
                              </h3>
                            </div>
                          </div>
                        </CarouselItem>
                        
                        {/* Content Slide */}
                        <CarouselItem>
                          <div className="aspect-[4/3] w-full p-4 overflow-auto bg-dream-purple/5">
                            <h3 className="text-lg font-bold mb-2 gradient-text">{dream.title}</h3>
                            <p className="text-sm whitespace-pre-wrap">{dream.content}</p>
                          </div>
                        </CarouselItem>
                        
                        {/* Analysis Slide (if available) */}
                        {dream.analysis && (
                          <CarouselItem>
                            <div className="aspect-[4/3] w-full p-4 overflow-auto bg-dream-purple/5">
                              <h3 className="text-lg font-bold mb-2 gradient-text">Dream Analysis</h3>
                              <p className="text-sm whitespace-pre-wrap">{dream.analysis}</p>
                            </div>
                          </CarouselItem>
                        )}
                      </CarouselContent>
                    </Carousel>
                    
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
                      <div className="bg-black/30 rounded-full backdrop-blur-md p-1 flex gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                        <div className="h-1.5 w-1.5 rounded-full bg-white/50"></div>
                        {dream.analysis && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white/50"></div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 flex items-center gap-1"
                          onClick={() => handleLike(dream.id)}
                        >
                          <Heart 
                            size={18} 
                            className={dream.liked || userLikes.includes(dream.id) ? "fill-red-500 text-red-500" : ""} 
                          />
                          <span className="text-xs">{dream.likeCount || dream.like_count || 0}</span>
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 flex items-center gap-1"
                          onClick={() => toggleComments(dream.id)}
                        >
                          <MessageSquare size={18} />
                          <span className="text-xs">
                            {dream.commentCount || dream.comment_count || 0}
                          </span>
                        </Button>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2"
                        onClick={() => handleShare(dream)}
                      >
                        <Share2 size={18} />
                      </Button>
                    </div>
                    
                    {dream.tags && dream.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {dream.tags.map((tagId: string) => (
                          <Badge
                            key={tagId}
                            variant="outline"
                            className="text-xs"
                          >
                            {tagId}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {activeComments === dream.id && (
                      <DreamComments dreamId={dream.id} />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LucidRepo;
