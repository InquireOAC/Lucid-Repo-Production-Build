
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
    console.log('New comment received:', record);

    // Get dream information and dream author
    const { data: dream, error: dreamError } = await supabase
      .from('dream_entries')
      .select('user_id, title')
      .eq('id', record.dream_id)
      .single();

    if (dreamError) {
      console.error('Error fetching dream:', dreamError);
      return new Response(JSON.stringify({ error: 'Failed to fetch dream' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Don't send notification if commenting on own dream
    if (dream.user_id === record.user_id) {
      console.log('User commented on their own dream, skipping notification');
      return new Response(JSON.stringify({ message: 'Self comment, no notification sent' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get commenter's profile information
    const { data: commenterProfile, error: commenterError } = await supabase
      .from('profiles')
      .select('username, display_name')
      .eq('id', record.user_id)
      .single();

    if (commenterError) {
      console.error('Error fetching commenter profile:', commenterError);
      return new Response(JSON.stringify({ error: 'Failed to fetch commenter profile' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if dream author has comment notifications enabled
    const { data: preferences, error: prefError } = await supabase
      .from('notification_preferences')
      .select('comment_notifications_enabled')
      .eq('user_id', dream.user_id)
      .single();

    if (prefError || !preferences?.comment_notifications_enabled) {
      console.log('User has comment notifications disabled or not found');
      return new Response(JSON.stringify({ message: 'Notifications disabled' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Prepare notification content
    const commenterName = commenterProfile.display_name || commenterProfile.username || 'Someone';
    const commentPreview = record.content.length > 30 
      ? record.content.substring(0, 30) + '...'
      : record.content;

    // Send push notification
    const notificationResponse = await supabase.functions.invoke('send-push-notification', {
      body: {
        userId: dream.user_id,
        title: `${commenterName} commented on your dream`,
        body: commentPreview,
        data: {
          type: 'comment',
          dreamId: record.dream_id,
          commentId: record.id,
          commenterId: record.user_id
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
    console.error('Error in comment-notification-trigger:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);
