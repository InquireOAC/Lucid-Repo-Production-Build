import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { falSeedanceImageToVideo } from "../_shared/fal-seedance.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const falKey = Deno.env.get("FAL_API_KEY");
    if (!falKey) throw new Error("FAL_API_KEY not configured");

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { dreamId, imageUrl, animationPrompt, skipDreamUpdate } = await req.json();
    if (!dreamId || !imageUrl) throw new Error("dreamId and imageUrl are required");

    // Check if user is admin (bypass subscription check)
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    const isAdmin = !!roleData;

    if (!isAdmin) {
      // Check subscription - only top-tier plans allowed
      const { data: subData } = await supabase
        .from("stripe_subscriptions")
        .select("status, price_id")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .eq("status", "active")
        .maybeSingle();

      if (!subData) {
        throw new Error("Active subscription required for video generation");
      }

      const allowedPriceIds = ["price_premium", "com.lucidrepo.unlimited.monthly"];
      if (!allowedPriceIds.includes(subData.price_id)) {
        throw new Error("Premium (Mystic) subscription required for video generation");
      }
    }

    const prompt = animationPrompt || "Gently animate this dream scene with subtle, dreamlike motion and atmospheric effects";
    const fileName = `${user.id}/${dreamId}-${Date.now()}.mp4`;

    const { videoUrl } = await falSeedanceImageToVideo(
      {
        prompt,
        imageUrl,
        aspectRatio: "9:16",
        duration: 5,
        resolution: "720p",
      },
      {
        supabaseUrl,
        serviceRoleKey: supabaseServiceKey,
        bucket: "dream-videos",
        path: fileName,
      },
    );

    // Update dream entry only if not a section-specific video
    if (!skipDreamUpdate) {
      const { error: updateError } = await supabase
        .from("dream_entries")
        .update({ video_url: videoUrl })
        .eq("id", dreamId)
        .eq("user_id", user.id);

      if (updateError) throw new Error(`Failed to update dream: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ videoUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Video generation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
