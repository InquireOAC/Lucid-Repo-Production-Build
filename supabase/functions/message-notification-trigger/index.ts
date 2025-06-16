
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { record } = await req.json();
    console.log('New message received:', record);

    // Get sender's profile information
    const { data: senderProfile, error: senderError } = await supabase
      .from('profiles')
      .select('username, display_name')
      .eq('id', record.sender_id)
      .single();

    if (senderError) {
      console.error('Error fetching sender profile:', senderError);
      return new Response(JSON.stringify({ error: 'Failed to fetch sender profile' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if receiver has message notifications enabled
    const { data: preferences, error: prefError } = await supabase
      .from('notification_preferences')
      .select('message_notifications_enabled')
      .eq('user_id', record.receiver_id)
      .single();

    if (prefError || !preferences?.message_notifications_enabled) {
      console.log('User has message notifications disabled or not found');
      return new Response(JSON.stringify({ message: 'Notifications disabled' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Prepare notification content
    const senderName = senderProfile.display_name || senderProfile.username || 'Someone';
    const messagePreview = record.content.length > 30 
      ? record.content.substring(0, 30) + '...'
      : record.content;

    // Send push notification
    const notificationResponse = await supabase.functions.invoke('send-push-notification', {
      body: {
        userId: record.receiver_id,
        title: `New message from ${senderName}`,
        body: messagePreview,
        data: {
          type: 'message',
          senderId: record.sender_id,
          messageId: record.id
        }
      }
    });

    if (notificationResponse.error) {
      console.error('Error sending push notification:', notificationResponse.error);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in message-notification-trigger:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);
