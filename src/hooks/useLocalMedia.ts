import { useState, useEffect } from 'react';
import { getCachedMedia, mediaCacheKey } from '@/utils/localMediaCache';

export function useLocalMedia(
  dreamId: string | undefined,
  remoteUrl: string | undefined | null,
  type: 'image' | 'video' = 'image'
): string | null {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(remoteUrl || null);

  useEffect(() => {
    if (!dreamId) {
      setResolvedUrl(remoteUrl || null);
      return;
    }

    let revoke: string | null = null;

    const resolve = async () => {
      const key = mediaCacheKey(dreamId, type);
      const cachedUrl = await getCachedMedia(key);
      if (cachedUrl) {
        revoke = cachedUrl;
        setResolvedUrl(cachedUrl);
      } else {
        setResolvedUrl(remoteUrl || null);
      }
    };

    resolve();

    return () => {
      if (revoke) {
        URL.revokeObjectURL(revoke);
      }
    };
  }, [dreamId, remoteUrl, type]);

  return resolvedUrl;
}
