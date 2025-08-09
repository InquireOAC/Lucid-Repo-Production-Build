
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
      console.log('ProfilePage: Fetching profile for username:', usernameParam);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", usernameParam)
          .maybeSingle();
        
        console.log('ProfilePage: Profile fetch result:', { data, error });
        setProfile(data);
      } catch (err) {
        console.error('ProfilePage: Error fetching profile:', err);
      }
    }
    if (usernameParam) fetchProfile();
  }, [usernameParam]);

  useEffect(() => {
    if (!profile?.id) return;
    async function getDreams() {
      console.log('ProfilePage: Fetching dreams for profile ID:', profile.id);
      try {
        let query = supabase
          .from("dream_entries")
          .select("*, profiles:user_id(username, profile_picture)")
          .eq("user_id", profile.id);
        if (profile.id !== user?.id) query = query.eq("is_public", true);
        query = query.order("created_at", { ascending: false });
        const { data, error } = await query;
        
        console.log('ProfilePage: Dreams fetch result:', { data, error });
        setPublicDreams(data ?? []);
      } catch (err) {
        console.error('ProfilePage: Error fetching dreams:', err);
      }
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
