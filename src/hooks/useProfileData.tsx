
import { useState, useEffect } from "react";
import { User, Profile } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProfileData = (user: User | null, profile: Profile | null, userId?: string) => {
  const [isOwnProfile, setIsOwnProfile] = useState<boolean>(false);
  const [viewedProfile, setViewedProfile] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  
  const [displayName, setDisplayName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [socialLinks, setSocialLinks] = useState({
    twitter: "",
    instagram: "",
    facebook: "",
    website: ""
  });
  
  const [dreamCount, setDreamCount] = useState<number>(0);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [conversations, setConversations] = useState<any[]>([]);
  const [subscription, setSubscription] = useState(null);
  
  // Initialize with own profile data or prepare for fetching other user's profile
  useEffect(() => {
    if (user && profile) {
      const isOwn = !userId || userId === user.id;
      setIsOwnProfile(isOwn);
      
      if (isOwn) {
        setDisplayName(profile.display_name || "");
        setUsername(profile.username || "");
        setBio(profile.bio || "");
        setAvatarUrl(profile.avatar_url || "");
        setSocialLinks({
          twitter: profile.twitter_url || "",
          instagram: profile.instagram_url || "",
          facebook: profile.facebook_url || "",
          website: profile.website_url || ""
        });
        setDreamCount(profile.dream_count || 0);
        setFollowersCount(profile.followers_count || 0);
        setFollowingCount(profile.following_count || 0);
      }
    }
  }, [user, profile, userId]);
  
  // Fetch another user's profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setViewedProfile(data);
        setDisplayName(data.display_name || "");
        setUsername(data.username || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url || "");
        setSocialLinks({
          twitter: data.twitter_url || "",
          instagram: data.instagram_url || "",
          facebook: data.facebook_url || "",
          website: data.website_url || ""
        });
        setDreamCount(data.dream_count || 0);
        setFollowersCount(data.followers_count || 0);
        setFollowingCount(data.following_count || 0);
        
        // Fetch conversations if needed
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
      toast.error("Couldn't load profile data");
    }
  };
  
  // Check if following a user
  const checkIfFollowing = async (userId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();
        
      if (error) throw error;
      
      setIsFollowing(!!data);
    } catch (error: any) {
      console.error('Error checking follow status:', error.message);
    }
  };
  
  // Follow/unfollow a user
  const handleFollow = async () => {
    if (!user || !userId) return;
    
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);
          
        if (error) throw error;
        
        setIsFollowing(false);
        toast.success("Unfollowed successfully");
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          });
          
        if (error) throw error;
        
        setIsFollowing(true);
        toast.success("Following successfully");
      }
      
      // Refresh counts
      fetchUserProfile(userId);
    } catch (error: any) {
      console.error('Error following/unfollowing:', error.message);
      toast.error("Action failed. Please try again.");
    }
  };
  
  // Fetch subscription data
  const fetchSubscription = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) throw error;
      
      setSubscription(data);
    } catch (error: any) {
      console.error('Error fetching subscription:', error.message);
    }
  };
  
  // Profile updates
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      const updates = {
        id: user.id,
        display_name: displayName,
        username: username,
        bio: bio,
        avatar_url: avatarUrl,
        updated_at: new Date()
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      toast.error("Failed to update profile");
    }
  };
  
  // Social links update
  const handleUpdateSocialLinks = async () => {
    if (!user) return;
    
    try {
      const updates = {
        id: user.id,
        twitter_url: socialLinks.twitter,
        instagram_url: socialLinks.instagram,
        facebook_url: socialLinks.facebook,
        website_url: socialLinks.website,
        updated_at: new Date()
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success("Social links updated successfully");
    } catch (error: any) {
      console.error('Error updating social links:', error.message);
      toast.error("Failed to update social links");
    }
  };
  
  // Avatar update
  const handleAvatarChange = (url: string) => {
    setAvatarUrl(url);
  };
  
  // Start conversation
  const handleStartConversation = async () => {
    if (!user || !userId) return;
    
    // Implementation would create or fetch existing conversation
    toast.info("Messaging feature coming soon");
  };
  
  // Sign out
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
    } catch (error: any) {
      console.error('Error signing out:', error.message);
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
