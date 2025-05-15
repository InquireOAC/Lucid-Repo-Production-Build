
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ProfileCard from "./ProfileCard";
import { useProfileFollowers } from "@/hooks/useProfileFollowers";
import { useProfileFollowAction } from "@/hooks/useProfileFollowAction";
import ProfileDreamList from "./ProfileDreamList";

// Use username param from routing (react-router-dom)
// <Route path="/profile/:username" element={<ProfilePage />} />

export default function ProfilePage({ usernameParam }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [publicDreams, setPublicDreams] = useState([]);
  const { followers, following, followersCount, followingCount, fetchFollowers, fetchFollowing } =
    useProfileFollowers(profile?.id);

  useEffect(() => {
    // Fetch profile by username
    async function fetchProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", usernameParam)
        .maybeSingle();
      setProfile(data);
    }
    if (usernameParam) fetchProfile();
  }, [usernameParam]);

  useEffect(() => {
    if (!profile?.id) return;
    // Only public dreams, unless it is user's own profile
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

  const { isFollowing, handleFollow, checkFollowing } = useProfileFollowAction(user, profile?.id, () => fetchFollowers());
  useEffect(() => { checkFollowing(); }, [profile?.id, user]);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="max-w-xl mx-auto">
      <ProfileCard
        profile={profile}
        followersCount={followersCount}
        followingCount={followingCount}
        isFollowing={isFollowing}
        onFollowToggle={handleFollow}
        canFollow={profile.id !== user?.id}
      />
      <div className="mt-8">
        <h3 className="font-bold text-lg mb-4">
          {profile.id === user?.id ? "Your Dreams" : `${profile.username}'s Dreams`}
        </h3>
        <ProfileDreamList dreams={publicDreams} user={user} />
      </div>
    </div>
  );
}
