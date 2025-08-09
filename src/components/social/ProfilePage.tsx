
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ProfileCard from "./ProfileCard";
import { useProfileFollowers } from "@/hooks/useProfileFollowers";
import { useProfileFollowAction } from "@/hooks/useProfileFollowAction";
import ProfileDreamList from "./ProfileDreamList";

export default function ProfilePage({ usernameParam }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [publicDreams, setPublicDreams] = useState([]);
  const { followers, following, followersCount, followingCount, fetchFollowers, fetchFollowing } =
    useProfileFollowers(profile?.id);

  useEffect(() => {
    async function fetchProfile() {
      // Use public_profiles view for secure access to public profile data
      const { data } = await supabase
        .from("public_profiles")
        .select("*")
        .eq("username", usernameParam)
        .maybeSingle();
      setProfile(data);
    }
    if (usernameParam) fetchProfile();
  }, [usernameParam]);

  useEffect(() => {
    if (!profile?.id) return;
    async function getDreams() {
      let query = supabase
        .from("dream_entries")
        .select("*, profiles:user_id(username, profile_picture)")
        .eq("user_id", profile.id);
      if (profile.id !== user?.id) query = query.eq("is_public", true);
      query = query.order("created_at", { ascending: false });
      const { data } = await query;
      setPublicDreams(data ?? []);
    }
    getDreams();
    fetchFollowers();
    fetchFollowing();
    // eslint-disable-next-line
  }, [profile]);

  const { isFollowing, handleFollow, checkFollowing } = useProfileFollowAction(
    user,
    profile?.id,
    () => {
      fetchFollowers();
      fetchFollowing();
    }
  );
  useEffect(() => { checkFollowing(); }, [profile?.id, user]);

  if (!profile) return <div>Loading...</div>;

  // Provide a no-op for refreshLikedDreams if not updating liked dreams from here
  const refreshLikedDreams = () => {};

  return (
    <div className="max-w-xl mx-auto">
      <ProfileCard
        profile={profile}
        followersCount={followersCount}
        followingCount={followingCount}
        isFollowing={isFollowing}
        onFollowToggle={async () => {
          await handleFollow();
          fetchFollowers();
          fetchFollowing();
        }}
        canFollow={profile.id !== user?.id}
      />
      <div className="mt-8">
        <h3 className="font-bold text-lg mb-4">
          {profile.id === user?.id ? "Your Dreams" : `${profile.username}'s Dreams`}
        </h3>
        <ProfileDreamList dreams={publicDreams} user={user} refreshLikedDreams={refreshLikedDreams} />
      </div>
    </div>
  );
}
