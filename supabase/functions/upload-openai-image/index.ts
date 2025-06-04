
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== UPLOAD OPENAI IMAGE FUNCTION STARTED ===");
    
    // Parse request body
    const { imageUrl, userId } = await req.json();
    
    if (!imageUrl) {
      console.error("Missing imageUrl in request body");
      return new Response(
        JSON.stringify({ error: "imageUrl is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Request params:", { imageUrl, userId });

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Fetch the image from OpenAI URL
    console.log("Fetching image from OpenAI URL:", imageUrl);
    
    const imageResponse = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Supabase-Function)',
        'Accept': 'image/*',
      },
    });

    // Step 2: Check that the fetch response is OK
    if (!imageResponse.ok) {
      console.error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
      return new Response(
        JSON.stringify({ 
          error: `Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Image fetch successful, status:", imageResponse.status);

    // Step 3: Convert response into a valid Blob
    const imageBlob = await imageResponse.blob();
    
    if (!imageBlob || imageBlob.size === 0) {
      console.error("Downloaded image is empty or invalid");
      return new Response(
        JSON.stringify({ error: "Downloaded image is empty or invalid" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Image blob created successfully, size:", imageBlob.size, "bytes");

    // Step 4: Create unique path with optional user_id prefix
    const timestamp = Date.now();
    const randomId = crypto.randomUUID();
    const fileName = `${timestamp}-${randomId}.png`;
    
    let filePath: string;
    if (userId) {
      filePath = `${userId}/${fileName}`;
    } else {
      filePath = `anonymous/${fileName}`;
    }

    console.log("Upload path:", filePath);

    // Step 5: Upload to Supabase Storage bucket "dream-images"
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('dream-images')
      .upload(filePath, imageBlob, {
        contentType: 'image/png',
        upsert: true,
        cacheControl: '31536000', // 1 year cache
      });

    // Step 6: Handle upload errors
    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return new Response(
        JSON.stringify({ 
          error: `Upload failed: ${uploadError.message}`,
          details: uploadError 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!uploadData?.path) {
      console.error("Upload succeeded but no path returned");
      return new Response(
        JSON.stringify({ error: "Upload succeeded but no path returned" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Upload successful:", uploadData);

    // Step 7: Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('dream-images')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData?.publicUrl;

    if (!publicUrl) {
      console.error("Failed to generate public URL");
      return new Response(
        JSON.stringify({ error: "Failed to generate public URL" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("=== UPLOAD COMPLETED SUCCESSFULLY ===");
    console.log("Public URL:", publicUrl);

    // Step 8: Return success response with public URL
    return new Response(
      JSON.stringify({ 
        success: true,
        publicUrl,
        path: filePath,
        size: imageBlob.size 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error("=== UPLOAD FUNCTION ERROR ===");
    console.error("Error details:", error);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: "Unexpected error during upload",
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
