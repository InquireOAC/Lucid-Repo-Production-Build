import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Challenge {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  required_tag: string;
  start_date: string;
  end_date: string;
  prize_description: string | null;
  status: string;
  banner_image_url: string | null;
  created_at: string;
  entry_count?: number;
}

export interface ChallengeEntry {
  id: string;
  challenge_id: string;
  user_id: string;
  dream_id: string;
  entered_at: string;
  profile?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
  dream?: {
    title: string;
    content: string;
    image_url: string | null;
  };
}

export const useChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChallenges = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('community_challenges')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      // Fetch entry counts for each challenge
      const withCounts = await Promise.all(
        data.map(async (c: any) => {
          const { count } = await supabase
            .from('challenge_entries')
            .select('*', { count: 'exact', head: true })
            .eq('challenge_id', c.id);
          return { ...c, entry_count: count || 0 };
        })
      );
      setChallenges(withCounts);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const createChallenge = async (challenge: {
    title: string;
    description: string;
    required_tag: string;
    start_date: string;
    end_date: string;
    prize_description?: string;
    status?: string;
  }) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('community_challenges')
      .insert({
        ...challenge,
        created_by: user.id,
        status: challenge.status || 'draft',
      })
      .select()
      .single();

    if (!error && data) {
      await fetchChallenges();
    }
    return { data, error };
  };

  const updateChallengeStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('community_challenges')
      .update({ status })
      .eq('id', id);
    if (!error) await fetchChallenges();
    return { error };
  };

  const fetchEntries = async (challengeId: string): Promise<ChallengeEntry[]> => {
    const { data } = await supabase
      .from('challenge_entries')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('entered_at', { ascending: false });

    if (!data || data.length === 0) return [];

    const userIds = [...new Set(data.map((e: any) => e.user_id))];
    const dreamIds = [...new Set(data.map((e: any) => e.dream_id))];

    const [profilesResult, dreamsResult] = await Promise.all([
      supabase.from('profiles').select('id, username, display_name, avatar_url').in('id', userIds),
      supabase.from('dream_entries').select('id, title, content, image_url').in('id', dreamIds),
    ]);

    const profileMap = new Map(profilesResult.data?.map((p: any) => [p.id, p]) || []);
    const dreamMap = new Map(dreamsResult.data?.map((d: any) => [d.id, d]) || []);

    return data.map((e: any) => ({
      ...e,
      profile: profileMap.get(e.user_id) || null,
      dream: dreamMap.get(e.dream_id) || null,
    }));
  };

  return {
    challenges,
    isLoading,
    createChallenge,
    updateChallengeStatus,
    fetchEntries,
    refetch: fetchChallenges,
  };
};
