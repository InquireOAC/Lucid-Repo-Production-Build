
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DreamEntry } from "@/types/dream";

// Import refactored components
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import EditProfileDialog from "@/components/profile/EditProfileDialog";
import SocialLinksDialog from "@/components/profile/SocialLinksDialog";
import SettingsDialog from "@/components/profile/SettingsDialog";
import MessagesDialog from "@/components/profile/MessagesDialog";
import LoadingScreen from "@/components/profile/LoadingScreen";
import UserNotFound from "@/components/profile/UserNotFound";
import SubscriptionDialog from "@/components/profile/SubscriptionDialog";

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [viewedProfile, setViewedProfile] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isSocialLinksOpen, setIsSocialLinksOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  
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
  const [isUploading, setIsUploading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  
  const [selectedDream, setSelectedDream] = useState<DreamEntry | null>(null);
  
  const profileToShow = isOwnProfile ? profile : viewedProfile;
  
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    // Determine if viewing own profile or someone else's
    if (userId && userId !== user.id) {
      setIsOwnProfile(false);
      fetchUserProfile(userId);
      checkIfFollowing(userId);
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
    
    fetchUserStats();
    fetchPublicDreams();
    fetchLikedDreams();
    
    if (isOwnProfile) {
      fetchConversations();
    }
  }, [user, profile, userId]);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);
  
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
      navigate("/");
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
        commentCount: dream.comment_count || 0, // Use 0 as fallback
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
          commentCount: dream.comment_count || 0, // Use 0 as fallback
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
        .single();

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
        .single();

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
      
      await refreshProfile();
      toast.success("Profile updated successfully!");
      setIsEditProfileOpen(false);
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
      
      await refreshProfile();
      toast.success("Social links updated successfully!");
      setIsSocialLinksOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Error updating social links");
    }
  };
  
  const handleAvatarChange = (url: string) => {
    setAvatarUrl(url);
  };
  
  const handleStartConversation = () => {
    // Navigate to messages with this user
    if (userId) {
      navigate(`/messages/${userId}`);
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  // Transform dream data to include comment_count
  const transformDreamData = (data: any[]): DreamEntry[] => {
    return data.map(dream => ({
      id: dream.id,
      title: dream.title,
      content: dream.content,
      date: dream.dream_date,
      tags: dream.tags || [],
      lucid: dream.lucid,
      mood: dream.mood,
      userId: dream.user_id,
      analysis: dream.analysis || "",
      isPublic: dream.is_public,
      likeCount: dream.like_count || 0,
      commentCount: dream.comment_count || 0,
      created_at: dream.created_at,
      updated_at: dream.updated_at,
      generatedImage: dream.image_url,
      imagePrompt: dream.image_prompt,
      liked: false,
      user_id: dream.user_id,
      is_public: dream.is_public,
      like_count: dream.like_count || 0,
      comment_count: dream.comment_count || 0,
      profiles: dream.profiles
    }));
  };
  
  // Loading state
  if (!user) {
    return <LoadingScreen />;
  }
  
  // User not found state
  if (!isOwnProfile && !viewedProfile) {
    return <UserNotFound onGoBack={() => navigate("/")} />;
  }
  
  // Main render
  return (
    <div className="min-h-screen dream-background p-4">
      <div className="max-w-3xl mx-auto">
        <ProfileHeader 
          profileToShow={profileToShow}
          isOwnProfile={isOwnProfile}
          dreamCount={dreamCount}
          followersCount={followersCount}
          followingCount={followingCount}
          isFollowing={isFollowing}
          setIsEditProfileOpen={setIsEditProfileOpen}
          setIsMessagesOpen={setIsMessagesOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          setIsSocialLinksOpen={setIsSocialLinksOpen}
          handleFollow={handleFollow}
          handleStartConversation={handleStartConversation}
        />
        
        <ProfileTabs 
          publicDreams={publicDreams}
          likedDreams={likedDreams}
          isOwnProfile={isOwnProfile}
        />
      </div>
      
      {/* Dialogs */}
      <EditProfileDialog 
        isOpen={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        displayName={displayName}
        setDisplayName={setDisplayName}
        username={username}
        setUsername={setUsername}
        bio={setBio}
        setBio={setBio}
        avatarUrl={avatarUrl}
        isUploading={isUploading}
        handleAvatarChange={handleAvatarChange}
        handleUpdateProfile={handleUpdateProfile}
        userId={user.id}
      />
      
      <SocialLinksDialog 
        isOpen={isSocialLinksOpen}
        onOpenChange={setIsSocialLinksOpen}
        socialLinks={socialLinks}
        setSocialLinks={setSocialLinks}
        handleUpdateSocialLinks={handleUpdateSocialLinks}
      />
      
      <SettingsDialog 
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        handleSignOut={handleSignOut}
        onSubscriptionClick={() => {
          setIsSettingsOpen(false);
          setIsSubscriptionOpen(true);
        }}
      />
      
      <MessagesDialog 
        isOpen={isMessagesOpen}
        onOpenChange={setIsMessagesOpen}
        conversations={conversations}
      />

      <SubscriptionDialog
        isOpen={isSubscriptionOpen}
        onOpenChange={setIsSubscriptionOpen}
        subscription={subscription}
      />
    </div>
  );
};

export default Profile;
