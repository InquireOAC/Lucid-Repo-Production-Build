import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PollResult {
  selected_option: string;
  vote_count: number;
}

export const usePollVotes = (announcementId: string) => {
  const { user } = useAuth();
  const [myVote, setMyVote] = useState<string | null>(null);
  const [results, setResults] = useState<PollResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    const [voteRes, resultsRes] = await Promise.all([
      supabase
        .from('poll_responses')
        .select('selected_option')
        .eq('announcement_id', announcementId)
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase.rpc('get_poll_results', { p_announcement_id: announcementId }),
    ]);

    if (voteRes.data) setMyVote(voteRes.data.selected_option);
    if (resultsRes.data) setResults(resultsRes.data as PollResult[]);
    setIsLoading(false);
  }, [user, announcementId]);

  const submitVote = useCallback(async (option: string) => {
    if (!user || isSubmitting) return;
    setIsSubmitting(true);

    const { error } = await supabase.from('poll_responses').insert({
      announcement_id: announcementId,
      user_id: user.id,
      selected_option: option,
    });

    if (!error) {
      setMyVote(option);
      // Refresh results
      const { data } = await supabase.rpc('get_poll_results', { p_announcement_id: announcementId });
      if (data) setResults(data as PollResult[]);
    }
    setIsSubmitting(false);
  }, [user, announcementId, isSubmitting]);

  return { myVote, results, isLoading, isSubmitting, fetchData, submitVote };
};
