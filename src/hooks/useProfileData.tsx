
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfileStats } from "./useProfileStats";
import { useProfileDreams } from "./useProfileDreams";
import { useFollowing } from "./useFollowing";
import { useProfileEditing } from "./useProfileEditing";
import { useSubscription } from "./useSubscription";
import { useConversations } from "./useConversations";

export const useProfileData = (user: any, profile: any, userId?: string) => {
  const [viewedProfile, setViewedProfile] = useState<any>(null);
  
  const { isFollowing, setIsFollowing, isOwnProfile, setIsOwnProfile, checkIfFollowing, handleFollow } = useFollowing(user, userId);
  const { displayName, setDisplayName, username, setUsername, bio, setBio, avatarUrl, setAvatarUrl, socialLinks, setSocialLinks, 
    handleUpdateProfile, handleUpdateSocialLinks, handleAvatarChange } = useProfileEditing(user);
  const { dreamCount, followersCount, followingCount, setFollowersCount, fetchUserStats } = useProfileStats(user, userId);
  const { publicDreams, likedDreams, fetchPublicDreams, fetchLikedDreams } = useProfileDreams(user, userId);
  const { subscription, fetchSubscription } = useSubscription(user);
  const { conversations, fetchConversations, handleStartConversation } = useConversations(user);
  
  useEffect(() => {
    // Determine if viewing own profile or someone else's
    if (userId && userId !== user?.id) {
      setIsOwnProfile(false);
    } else {
      setIsOwnProfile(true);
      if (profile) {
        setDisplayName(profile.display_name || "");
        setUsername(profile.username || "");
        setBio(profile.bio || "");
        setAvatarUrl(profile.avatar_url || "");
        
        // Parse social links from profile
        if (profile.social_links) {
          setSocialLinks({
            twitter: profile.social_links.twitter || "",
            instagram: profile.social_links.instagram || "",
            facebook: profile.social_links.facebook || "",
            website: profile.social_links.website || ""
          });
        }
      }
    }
    
    if (user) {
      fetchUserStats();
      fetchPublicDreams();
      fetchLikedDreams();
      
      if (isOwnProfile) {
        fetchConversations();
      }
    }
  }, [user, profile, userId]);
  
  const fetchUserProfile = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      setViewedProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Could not load user profile");
    }
  };
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  return {
    isOwnProfile,
    viewedProfile,
    isFollowing,
    displayName,
    username,
    bio,
    avatarUrl,
    socialLinks,
    dreamCount,
    followersCount,
    followingCount,
    publicDreams,
    likedDreams,
    conversations,
    subscription,
    fetchUserProfile,
    checkIfFollowing,
    handleFollow,
    fetchSubscription,
    handleUpdateProfile,
    handleUpdateSocialLinks,
    handleAvatarChange,
    handleStartConversation,
    handleSignOut
  };
};
