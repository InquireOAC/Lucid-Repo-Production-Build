
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
  // Fix: always use the UUID of the fetched profile for follow
  const [profileIdToUse, setProfileIdToUse] = useState<string | undefined>(undefined);

  const { dreamCount, followersCount, followingCount, setFollowersCount, setFollowingCount, fetchUserStats } = useProfileStats(user, profileIdentifier);

  const {
    isFollowing,
    setIsFollowing,
    isOwnProfile,
    setIsOwnProfile,
    checkIfFollowing,
    handleFollow,
  } = useFollowing(
    user,
    profileIdToUse,
    setFollowersCount,
    setFollowingCount,
    fetchUserStats
  );

  const {
    displayName, setDisplayName, username, setUsername, bio, setBio,
    avatarSymbol, setAvatarSymbol, avatarColor, setAvatarColor, socialLinks, setSocialLinks,
    handleUpdateProfile, handleUpdateSocialLinks
  } = useProfileEditing(user);
  const { publicDreams, likedDreams, fetchPublicDreams, fetchLikedDreams } = useProfileDreams(user, profileIdentifier);
  const { subscription, fetchSubscription, refreshSubscription } = useSubscription(user);
  const { conversations, fetchConversations, handleStartConversation } = useConversations(user);
  
  useEffect(() => {
    // Now supports profileIdentifier which could be username or id
    if (profileIdentifier && profileIdentifier !== user?.id && profileIdentifier !== profile?.username) {
      setIsOwnProfile(false);
      fetchUserProfile(profileIdentifier); // Will set profileIdToUse after fetch
      // No longer runs checkIfFollowing here, do it after viewedProfile fetch
      return;
    } else {
      setIsOwnProfile(true);
      if (profile) {
        setDisplayName(profile.display_name || "");
        setUsername(profile.username || "");
        setBio(profile.bio || "");
        setAvatarSymbol(profile.avatar_symbol || "");
        setAvatarColor(profile.avatar_color || "");

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
  
  // When viewedProfile updates, set profileIdToUse
  useEffect(() => {
    if (viewedProfile && viewedProfile.id) {
      setProfileIdToUse(viewedProfile.id);
      checkIfFollowing(viewedProfile.id);
    }
  }, [viewedProfile]);

  const fetchUserProfile = async (identifier: string) => {
    try {
      let data, error;
      if (/^[0-9a-fA-F-]{36}$/.test(identifier)) {
        // Fetch by id
        ({ data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", identifier)
          .maybeSingle());
      } else {
        // Fetch by username, but after fetch always set profileIdToUse to id
        ({ data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", identifier)
          .maybeSingle());
      }

      if (error || !data) throw error || new Error("Not found");
      setViewedProfile(data);
      setProfileIdToUse(data.id);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Could not load user profile");
      setViewedProfile(null);
      setProfileIdToUse(undefined);
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
    avatarSymbol,
    setAvatarSymbol,
    avatarColor,
    setAvatarColor,
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
    refreshSubscription,
    handleUpdateProfile,
    handleUpdateSocialLinks,
    handleStartConversation,
    handleSignOut
  };
};
