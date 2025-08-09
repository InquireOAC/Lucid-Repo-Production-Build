import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LearningLevel {
  id: string;
  level_number: number;
  title: string;
  description: string;
  content: any;
  xp_required: number;
  created_at: string;
}

export const useLearningLevels = () => {
  const [levels, setLevels] = useState<LearningLevel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_levels')
        .select('*')
        .order('level_number');

      if (error) throw error;
      setLevels(data || []);
    } catch (error) {
      console.error('Error fetching learning levels:', error);
      toast.error('Failed to load learning levels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  return {
    levels,
    loading,
    refetch: fetchLevels
  };
};