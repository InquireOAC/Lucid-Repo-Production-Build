// ============================================================
// useGlobalEnvironments
// Fetch and create world/location entries from global_environments.
// Mirrors Lucid Engine's useGlobalEnvironments hook so the same
// world library is accessible from both apps.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { GlobalEnvironment } from '@/types/dream';

interface UseGlobalEnvironmentsOptions {
  searchQuery?: string;
  environmentType?: 'world' | 'location' | 'all';
}

interface UseGlobalEnvironmentsReturn {
  environments: GlobalEnvironment[];
  worlds: GlobalEnvironment[];
  locations: GlobalEnvironment[];
  loading: boolean;
  createEnvironment: (env: Omit<GlobalEnvironment, 'id' | 'userId' | 'createdAt'>) => Promise<GlobalEnvironment | null>;
  deleteEnvironment: (id: string) => Promise<void>;
  reload: () => void;
}

export function useGlobalEnvironments({
  searchQuery = '',
  environmentType = 'all',
}: UseGlobalEnvironmentsOptions = {}): UseGlobalEnvironmentsReturn {
  const { user } = useAuth();
  const [environments, setEnvironments] = useState<GlobalEnvironment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);

    let query = supabase
      .from('global_environments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (environmentType !== 'all') {
      query = query.eq('environment_type', environmentType);
    }
    if (searchQuery.trim()) {
      query = query.ilike('name', `%${searchQuery.trim()}%`);
    }

    const { data, error } = await query;
    if (!error && data) {
      setEnvironments(data.map(row => ({
        id:                row.id,
        userId:            row.user_id,
        name:              row.name,
        description:       row.description ?? undefined,
        referenceImageUrl: row.primary_image_url ?? undefined,
        tags:              row.tags ?? [],
        createdAt:         row.created_at,
      })));
    }
    setLoading(false);
  }, [user?.id, searchQuery, environmentType]);

  useEffect(() => { fetch(); }, [fetch]);

  const createEnvironment = useCallback(async (
    env: Omit<GlobalEnvironment, 'id' | 'userId' | 'createdAt'>
  ): Promise<GlobalEnvironment | null> => {
    if (!user?.id) return null;

    const { data, error } = await supabase
      .from('global_environments')
      .insert({
        user_id:           user.id,
        name:              env.name,
        description:       env.description ?? null,
        primary_image_url: env.referenceImageUrl ?? null,
        tags:              env.tags ?? [],
        environment_type:  'world',
      })
      .select()
      .single();

    if (error || !data) return null;

    const created: GlobalEnvironment = {
      id:                data.id,
      userId:            data.user_id,
      name:              data.name,
      description:       data.description ?? undefined,
      referenceImageUrl: data.primary_image_url ?? undefined,
      tags:              data.tags ?? [],
      createdAt:         data.created_at,
    };

    setEnvironments(prev => [created, ...prev]);
    return created;
  }, [user?.id]);

  const deleteEnvironment = useCallback(async (id: string) => {
    await supabase.from('global_environments').delete().eq('id', id);
    setEnvironments(prev => prev.filter(e => e.id !== id));
  }, []);

  const worlds = environments.filter(e => !e.tags.includes('location'));
  const locations = environments.filter(e => e.tags.includes('location'));

  return { environments, worlds, locations, loading, createEnvironment, deleteEnvironment, reload: fetch };
}
