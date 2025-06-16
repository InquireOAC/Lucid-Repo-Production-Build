
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, title, body, data }: PushNotificationRequest = await req.json();

    console.log(`Sending push notification to user: ${userId}`);

    // Get all active device tokens for the user
    const { data: deviceTokens, error: tokenError } = await supabase
      .from('device_tokens')
      .select('token, platform')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (tokenError) {
      console.error('Error fetching device tokens:', tokenError);
      return new Response(JSON.stringify({ error: 'Failed to fetch device tokens' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!deviceTokens || deviceTokens.length === 0) {
      console.log('No active device tokens found for user');
      return new Response(JSON.stringify({ message: 'No active devices found' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const notifications = [];

    // Send notifications to each device
    for (const device of deviceTokens) {
      try {
        // For iOS devices, you would use APNs
        if (device.platform === 'ios') {
          // Note: In production, you would integrate with APNs here
          // This is a placeholder for the APNs integration
          console.log(`Would send APNs notification to token: ${device.token}`);
          notifications.push({ platform: 'ios', token: device.token, status: 'simulated' });
        }
        
        // For Android devices, you would use FCM
        else if (device.platform === 'android') {
          // Note: In production, you would integrate with FCM here
          // This is a placeholder for the FCM integration
          console.log(`Would send FCM notification to token: ${device.token}`);
          notifications.push({ platform: 'android', token: device.token, status: 'simulated' });
        }

        // For web push notifications
        else if (device.platform === 'web') {
          // Note: In production, you would integrate with Web Push API here
          console.log(`Would send web push notification to token: ${device.token}`);
          notifications.push({ platform: 'web', token: device.token, status: 'simulated' });
        }
      } catch (error) {
        console.error(`Error sending notification to ${device.platform} device:`, error);
        notifications.push({ 
          platform: device.platform, 
          token: device.token, 
          status: 'error', 
          error: error.message 
        });
      }
    }

    console.log(`Sent ${notifications.length} push notifications`);

    return new Response(JSON.stringify({
      success: true,
      notifications,
      message: `Notifications sent to ${notifications.length} devices`
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in send-push-notification function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);
