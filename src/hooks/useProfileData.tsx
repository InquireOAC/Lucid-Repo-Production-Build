
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfileStats } from "./useProfileStats";
import { useProfileDreams } from "./useProfileDreams";
import { useFollowing } from "./useFollowing";
import { useProfileEditing } from "./useProfileEditing";
import { useSubscription } from "./useSubscription";
import { useConversations } from "./useConversations";

// Helper to check if a string is a UUID (very basic check)
function isUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export const useProfileData = (user: any, profile: any, profileIdentifier?: string) => {
  const [viewedProfile, setViewedProfile] = useState<any>(null);
  
  const { isFollowing, setIsFollowing, isOwnProfile, setIsOwnProfile, checkIfFollowing, handleFollow } = useFollowing(user, profileIdentifier);
  const { displayName, setDisplayName, username, setUsername, bio, setBio, avatarUrl, setAvatarUrl, socialLinks, setSocialLinks, 
    handleUpdateProfile, handleUpdateSocialLinks, handleAvatarChange } = useProfileEditing(user);
  const { dreamCount, followersCount, followingCount, setFollowersCount, fetchUserStats } = useProfileStats(user, profileIdentifier);
  const { publicDreams, likedDreams, fetchPublicDreams, fetchLikedDreams } = useProfileDreams(user, profileIdentifier);
  const { subscription, fetchSubscription } = useSubscription(user);
  const { conversations, fetchConversations, handleStartConversation } = useConversations(user);
  
  useEffect(() => {
    // Now supports profileIdentifier which could be username or id
    if (profileIdentifier && profileIdentifier !== user?.id && profileIdentifier !== profile?.username) {
      setIsOwnProfile(false);
      fetchUserProfile(profileIdentifier); // Fetch the other user's profile by id or username
      checkIfFollowing(profileIdentifier);
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
  }, [user, profile, profileIdentifier]);
  
  const fetchUserProfile = async (identifier: string) => {
    try {
      let data, error;
      if (isUUID(identifier)) {
        // Fetch by id
        ({ data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", identifier)
          .maybeSingle());
      } else {
        // Fetch by username
        ({ data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", identifier)
          .maybeSingle());
      }

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
