import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

function formatDuration(duration: string): number {
  // Convert ISO 8601 duration (PT4M13S) to seconds
  const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!matches) return 0;
  
  const hours = parseInt(matches[1] || '0');
  const minutes = parseInt(matches[2] || '0');
  const seconds = parseInt(matches[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { youtube_url, dreamer_story_name } = await req.json();

    if (!youtube_url || !dreamer_story_name) {
      return new Response(
        JSON.stringify({ error: 'YouTube URL and dreamer story name are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const youtubeId = extractYouTubeId(youtube_url);
    if (!youtubeId) {
      return new Response(
        JSON.stringify({ error: 'Invalid YouTube URL' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch video data from YouTube API
    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const youtubeResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${youtubeId}&part=snippet,statistics,contentDetails&key=${apiKey}`
    );

    if (!youtubeResponse.ok) {
      throw new Error('Failed to fetch YouTube data');
    }

    const youtubeData = await youtubeResponse.json();
    
    if (!youtubeData.items || youtubeData.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Video not found on YouTube' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const video = youtubeData.items[0];
    const snippet = video.snippet;
    const statistics = video.statistics;
    const contentDetails = video.contentDetails;

    // Get the current user
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if video already exists
    const { data: existingVideo, error: checkError } = await supabase
      .from('video_entries')
      .select('*')
      .eq('youtube_id', youtubeId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking for existing video:', checkError);
      return new Response(
        JSON.stringify({ error: 'Failed to check for existing video' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const videoData = {
      youtube_id: youtubeId,
      youtube_url: youtube_url,
      title: snippet.title,
      description: snippet.description,
      thumbnail_url: snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url,
      dreamer_story_name: dreamer_story_name,
      duration: formatDuration(contentDetails.duration),
      view_count: parseInt(statistics.viewCount || '0'),
      like_count: parseInt(statistics.likeCount || '0'),
      published_at: snippet.publishedAt,
      is_published: true, // Auto-publish videos
      created_by: user.id
    };

    let data, error;
    let isUpdate = false;

    if (existingVideo) {
      // Update existing video
      const { data: updateData, error: updateError } = await supabase
        .from('video_entries')
        .update({
          ...videoData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingVideo.id)
        .select()
        .single();
      
      data = updateData;
      error = updateError;
      isUpdate = true;
    } else {
      // Insert new video
      const { data: insertData, error: insertError } = await supabase
        .from('video_entries')
        .insert([videoData])
        .select()
        .single();
      
      data = insertData;
      error = insertError;
    }

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save video entry' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        video: data,
        message: isUpdate ? 'Video updated and published successfully' : 'Video entry created and published successfully'
      }),
      { 
        status: isUpdate ? 200 : 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});