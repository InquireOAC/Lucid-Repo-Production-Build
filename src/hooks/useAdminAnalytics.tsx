import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay } from 'date-fns';

export interface DataPoint {
  date: string;
  value: number;
}

interface AdminAnalytics {
  newUsers: DataPoint[];
  newSubscriptions: DataPoint[];
  mrr: number;
  monthlyActiveUsers: number;
  imageGenerations: DataPoint[];
  videoGenerations: DataPoint[];
  publicDreams: DataPoint[];
  retention: number;
  isLoading: boolean;
}

function buildDateMap(days: number): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    map.set(format(subDays(new Date(), i), 'yyyy-MM-dd'), 0);
  }
  return map;
}

function mapToDataPoints(map: Map<string, number>): DataPoint[] {
  return Array.from(map.entries()).map(([date, value]) => ({ date, value }));
}

export const useAdminAnalytics = (rangeDays: number = 30) => {
  const [data, setData] = useState<Omit<AdminAnalytics, 'isLoading'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      const since = startOfDay(subDays(new Date(), rangeDays)).toISOString();
      const sevenDaysAgo = startOfDay(subDays(new Date(), 7)).toISOString();
      const fourteenDaysAgo = startOfDay(subDays(new Date(), 14)).toISOString();

      const [
        profilesRes,
        subsRes,
        activeSubsRes,
        dreamsRes,
        thisWeekUsersRes,
        lastWeekUsersRes,
      ] = await Promise.all([
        // New users in range
        supabase
          .from('profiles')
          .select('created_at')
          .gte('created_at', since)
          .order('created_at', { ascending: true }),
        // New subscriptions in range
        supabase
          .from('stripe_subscriptions')
          .select('created_at, price_id')
          .gte('created_at', since)
          .is('deleted_at', null)
          .order('created_at', { ascending: true }),
        // All active subs for MRR
        supabase
          .from('stripe_subscriptions')
          .select('price_id')
          .eq('status', 'active')
          .is('deleted_at', null),
        // Dream entries in range (for images, videos, public, MAU)
        supabase
          .from('dream_entries')
          .select('created_at, user_id, image_url, video_url, is_public')
          .gte('created_at', since)
          .order('created_at', { ascending: true }),
        // Users active this week
        supabase
          .from('dream_entries')
          .select('user_id')
          .gte('created_at', sevenDaysAgo),
        // Users active last week (7-14 days ago)
        supabase
          .from('dream_entries')
          .select('user_id')
          .gte('created_at', fourteenDaysAgo)
          .lt('created_at', sevenDaysAgo),
      ]);

      // Process new users by day
      const usersMap = buildDateMap(rangeDays);
      (profilesRes.data || []).forEach((p) => {
        const day = format(new Date(p.created_at), 'yyyy-MM-dd');
        if (usersMap.has(day)) usersMap.set(day, (usersMap.get(day) || 0) + 1);
      });

      // Process subscriptions by day
      const subsMap = buildDateMap(rangeDays);
      (subsRes.data || []).forEach((s) => {
        const day = format(new Date(s.created_at!), 'yyyy-MM-dd');
        if (subsMap.has(day)) subsMap.set(day, (subsMap.get(day) || 0) + 1);
      });

      // MRR calculation
      let mrr = 0;
      (activeSubsRes.data || []).forEach((s) => {
        if (s.price_id === 'price_basic') mrr += 4.99;
        else if (s.price_id === 'price_premium') mrr += 15.99;
      });

      // Process dream entries
      const imageMap = buildDateMap(rangeDays);
      const videoMap = buildDateMap(rangeDays);
      const publicMap = buildDateMap(rangeDays);
      const mauSet = new Set<string>();

      (dreamsRes.data || []).forEach((d) => {
        const day = format(new Date(d.created_at), 'yyyy-MM-dd');
        if (d.image_url) {
          if (imageMap.has(day)) imageMap.set(day, (imageMap.get(day) || 0) + 1);
        }
        if (d.video_url) {
          if (videoMap.has(day)) videoMap.set(day, (videoMap.get(day) || 0) + 1);
        }
        if (d.is_public) {
          if (publicMap.has(day)) publicMap.set(day, (publicMap.get(day) || 0) + 1);
        }
        mauSet.add(d.user_id);
      });

      // Retention
      const thisWeekSet = new Set((thisWeekUsersRes.data || []).map((d) => d.user_id));
      const lastWeekSet = new Set((lastWeekUsersRes.data || []).map((d) => d.user_id));
      const retention = lastWeekSet.size > 0
        ? Math.round((thisWeekSet.size / lastWeekSet.size) * 100)
        : 0;

      setData({
        newUsers: mapToDataPoints(usersMap),
        newSubscriptions: mapToDataPoints(subsMap),
        mrr: Math.round(mrr * 100) / 100,
        monthlyActiveUsers: mauSet.size,
        imageGenerations: mapToDataPoints(imageMap),
        videoGenerations: mapToDataPoints(videoMap),
        publicDreams: mapToDataPoints(publicMap),
        retention,
      });
      setIsLoading(false);
    };

    fetchAnalytics();
  }, [rangeDays]);

  return useMemo(() => ({
    ...data,
    isLoading,
  }), [data, isLoading]) as AdminAnalytics;
};
