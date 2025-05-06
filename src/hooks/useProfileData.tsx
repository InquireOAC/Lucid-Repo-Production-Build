
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DreamEntry } from "@/types/dream";

export const useProfileData = (user: any, profile: any, userId?: string) => {
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [viewedProfile, setViewedProfile] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  const [socialLinks, setSocialLinks] = useState({
    twitter: "",
    instagram: "",
    facebook: "",
    website: ""
  });
  
  const [dreamCount, setDreamCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  
  const [publicDreams, setPublicDreams] = useState<DreamEntry[]>([]);
  const [likedDreams, setLikedDreams] = useState<DreamEntry[]>([]);
  const [conversations, setConversations] = useState([]);
  const [subscription, setSubscription] = useState<any>(null);
  
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
  
  const checkIfFollowing = async (targetUserId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("followers")
        .select("*")
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
        throw error;
      }
      
      setIsFollowing(!!data);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };
  
  const handleFollow = async () => {
    if (!user || isOwnProfile) return;
    
    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from("followers")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId);
        
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
        toast.success("Unfollowed user");
      } else {
        // Follow
        await supabase
          .from("followers")
          .insert({ follower_id: user.id, following_id: userId });
        
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast.success("Now following user");
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
      toast.error("Failed to update follow");
    }
  };
  
  const fetchUserStats = async () => {
    if (!user) return;
    
    const targetUserId = userId || user.id;
    
    try {
      // Get dream count
      const { data: dreams, error: dreamsError } = await supabase
        .from("dream_entries")
        .select("id")
        .eq("user_id", targetUserId)
        .eq("is_public", true);
      
      if (!dreamsError) {
        setDreamCount(dreams?.length || 0);
      }
      
      // Get followers count
      const { count: followers, error: followersError } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("following_id", targetUserId);
      
      if (!followersError) {
        setFollowersCount(followers || 0);
      }
      
      // Get following count
      const { count: following, error: followingError } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", targetUserId);
      
      if (!followingError) {
        setFollowingCount(following || 0);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };
  
  const fetchPublicDreams = async () => {
    if (!user) return;
    
    const targetUserId = userId || user.id;
    
    try {
      const { data, error } = await supabase
        .from("dream_entries")
        .select("*")
        .eq("user_id", targetUserId)
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Map Supabase field names to our app's field names for consistency
      const transformedDreams = data.map((dream: any) => ({
        ...dream,
        isPublic: dream.is_public,
        likeCount: dream.like_count || 0,
        commentCount: dream.comment_count || 0, // Ensure commentCount exists
        userId: dream.user_id,
        profiles: dream.profiles
      }));
      
      setPublicDreams(transformedDreams || []);
    } catch (error) {
      console.error("Error fetching public dreams:", error);
    }
  };
  
  const fetchLikedDreams = async () => {
    if (!user) return;
    
    try {
      // For viewing own profile or someone else's
      const targetUserId = userId || user.id;
      
      // First get the liked dream IDs
      const { data: likedData, error: likedError } = await supabase
        .from("dream_likes")
        .select("dream_id")
        .eq("user_id", targetUserId);
      
      if (likedError) throw likedError;
      
      if (likedData && likedData.length > 0) {
        const dreamIds = likedData.map(item => item.dream_id);
        
        // Then fetch the actual dreams
        const { data: dreamData, error: dreamError } = await supabase
          .from("dream_entries")
          .select("*, profiles:user_id(username, display_name, avatar_url)")
          .in("id", dreamIds)
          .eq("is_public", true)
          .order("created_at", { ascending: false });
        
        if (dreamError) throw dreamError;
        
        // Map fields for consistency
        const transformedDreams = dreamData?.map(dream => ({
          ...dream,
          isPublic: dream.is_public,
          likeCount: dream.like_count || 0,
          commentCount: dream.comment_count || 0, // Ensure commentCount exists
          userId: dream.user_id,
          profiles: dream.profiles
        }));
        
        setLikedDreams(transformedDreams || []);
      } else {
        setLikedDreams([]);
      }
    } catch (error) {
      console.error("Error fetching liked dreams:", error);
    }
  };
  
  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      // Get unique conversation partners
      const { data: sent, error: sentError } = await supabase
        .from("messages")
        .select("receiver_id")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });
      
      const { data: received, error: receivedError } = await supabase
        .from("messages")
        .select("sender_id")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false });
      
      if (sentError || receivedError) throw sentError || receivedError;
      
      // Combine and get unique user IDs
      const userIds = new Set([
        ...(sent || []).map((msg: any) => msg.receiver_id),
        ...(received || []).map((msg: any) => msg.sender_id)
      ]);
      
      if (userIds.size > 0) {
        // Get profiles for these users
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .in("id", Array.from(userIds));
        
        if (profilesError) throw profilesError;
        
        setConversations(profiles || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const fetchSubscription = async () => {
    try {
      console.log("Fetching subscription data...");
      // First get the customer record
      const { data: customerData, error: customerError } = await supabase
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (customerError) {
        console.error('Error fetching customer:', customerError);
        return;
      }

      if (!customerData?.customer_id) {
        console.log("No customer ID found for user");
        return;
      }

      console.log(`Found customer ID: ${customerData.customer_id}`);

      // Then get the subscription details
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('stripe_subscriptions')
        .select('*')
        .eq('customer_id', customerData.customer_id)
        .maybeSingle();

      if (subscriptionError) {
        console.error('Error fetching subscription:', subscriptionError);
        return;
      }

      if (subscriptionData) {
        console.log("Subscription data found:", subscriptionData);
        setSubscription({
          plan: subscriptionData.price_id === 'price_premium' ? 'Premium' : 'Basic',
          status: subscriptionData.status,
          currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000).toLocaleDateString(),
          analysisCredits: {
            used: subscriptionData.dream_analyses_used || 0,
            total: subscriptionData.price_id === 'price_premium' ? 999999 : 10
          },
          imageCredits: {
            used: subscriptionData.image_generations_used || 0,
            total: subscriptionData.price_id === 'price_premium' ? 20 : 5
          }
        });
      } else {
        console.log("No subscription data found");
      }
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
    }
  };
  
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          username,
          bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error updating profile");
    }
  };
  
  const handleUpdateSocialLinks = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          social_links: socialLinks,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      toast.success("Social links updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error updating social links");
    }
  };
  
  const handleAvatarChange = (url: string) => {
    setAvatarUrl(url);
  };
  
  const handleStartConversation = () => {
    // Navigate to messages with this user
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
