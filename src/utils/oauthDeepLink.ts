import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { supabase } from '@/integrations/supabase/client';

export function setupOAuthDeepLinkListener() {
  if (!Capacitor.isNativePlatform()) return;

  App.addListener('appUrlOpen', async ({ url }) => {
    // Expected URL: app.dreamweaver.lucidrepo://callback#access_token=...&refresh_token=...
    if (!url.includes('callback')) return;

    const hashPart = url.split('#')[1];
    if (!hashPart) return;

    const params = new URLSearchParams(hashPart);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      try {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          console.error('OAuth deep link session error:', error.message);
        } else {
          console.log('OAuth deep link: session set successfully');
        }
      } catch (err) {
        console.error('OAuth deep link error:', err);
      }
    }
  });
}
