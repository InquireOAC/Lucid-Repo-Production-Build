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
    // Logic now always checks if the provided userId is 
    // - present 
    // - and NOT the logged-in user's id
    // Show visiting profile only in that case
    if (userId && userId !== user?.id) {
      setIsOwnProfile(false);
      fetchUserProfile(userId); // Fetch the other user's profile by id
      checkIfFollowing(userId);
      return;
    } else {
      setIsOwnProfile(true);
      if (profile) {
        setDisplayName(profile.display_name || "");
        setUsername(profile.username || "");
        setBio(profile.bio || "");
        setAvatarUrl(profile.avatar_url || "");

        if (profile.social_links) {
          setSocialLinks({
            twitter: profile.social_links?.twitter || "",
            instagram: profile.social_links?.instagram || "",
            facebook: profile.social_links?.facebook || "",
            website: profile.social_links?.website || ""
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
      // Fetch exactly by id
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) throw error || new Error("Not found");

      setViewedProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Could not load user profile");
      setViewedProfile(null);
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
    setDisplayName,
    username,
    setUsername,
    bio,
    setBio,
    avatarUrl,
    setAvatarUrl,
    socialLinks,
    setSocialLinks,
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
