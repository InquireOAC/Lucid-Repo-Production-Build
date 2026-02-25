import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Generate a JWT from a Google Service Account key
async function getGoogleAccessToken(saKey: any): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: saKey.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj: any) => {
    const json = JSON.stringify(obj);
    const b64 = btoa(json);
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import the private key
  const pemContents = saKey.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");
  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${unsignedToken}.${sigB64}`;

  // Exchange JWT for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to get Google access token: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const saKeyRaw = Deno.env.get("GOOGLE_VERTEX_SA_KEY");
    const projectId = Deno.env.get("GOOGLE_CLOUD_PROJECT_ID");

    if (!saKeyRaw || !projectId) {
      throw new Error("Google Cloud credentials not configured");
    }

    const saKey = JSON.parse(saKeyRaw);

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { dreamId, imageUrl, animationPrompt, aspectRatio: clientAspectRatio } = await req.json();
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
      // Check subscription
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
    }

    // Fetch the image and convert to base64
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) throw new Error("Failed to fetch dream image");
    const imageBuffer = await imageRes.arrayBuffer();
    // Chunk the conversion to avoid stack overflow on large images
    const bytes = new Uint8Array(imageBuffer);
    let imageBase64 = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      imageBase64 += String.fromCharCode(...chunk);
    }
    imageBase64 = btoa(imageBase64);

    // Determine mime type
    const contentType = imageRes.headers.get("content-type") || "image/png";

    // Detect aspect ratio from image dimensions
    // Parse PNG/JPEG headers to get width/height
    // Veo only supports "16:9" and "9:16" — no "1:1"
    let detectedAspectRatio = "16:9"; // safe default
    if (clientAspectRatio && clientAspectRatio !== "1:1") {
      detectedAspectRatio = clientAspectRatio;
    } else if (!clientAspectRatio) {
      try {
        let ratio = 1;
        if (bytes[0] === 0x89 && bytes[1] === 0x50) {
          const width = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
          const height = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
          ratio = width / height;
          console.log(`Detected PNG dimensions: ${width}x${height}, ratio: ${ratio}`);
        } else if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
          let offset = 2;
          while (offset < bytes.length - 8) {
            if (bytes[offset] === 0xFF && (bytes[offset + 1] === 0xC0 || bytes[offset + 1] === 0xC2)) {
              const height = (bytes[offset + 5] << 8) | bytes[offset + 6];
              const width = (bytes[offset + 7] << 8) | bytes[offset + 8];
              ratio = width / height;
              console.log(`Detected JPEG dimensions: ${width}x${height}, ratio: ${ratio}`);
              break;
            }
            const segLen = (bytes[offset + 2] << 8) | bytes[offset + 3];
            offset += 2 + segLen;
          }
        }
        // Only use 9:16 for clearly portrait images; everything else gets 16:9
        detectedAspectRatio = ratio < 0.7 ? "9:16" : "16:9";
      } catch (dimErr) {
        console.warn("Failed to detect image dimensions, using 16:9:", dimErr);
      }
    }

    // Get Google access token
    const accessToken = await getGoogleAccessToken(saKey);

    const prompt = animationPrompt || "Gently animate this dream scene with subtle, dreamlike motion and atmospheric effects";
    const modelId = "veo-3.0-generate-preview";
    const location = "us-central1";

    // Start video generation
    const veoUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:predictLongRunning`;

    console.log("Using aspect ratio:", detectedAspectRatio);

    const veoRes = await fetch(veoUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [
          {
            prompt,
            image: {
              bytesBase64Encoded: imageBase64,
              mimeType: contentType,
            },
          },
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: detectedAspectRatio,
        },
      }),
    });

    if (!veoRes.ok) {
      const errText = await veoRes.text();
      throw new Error(`Veo API error: ${veoRes.status} - ${errText}`);
    }

    const operation = await veoRes.json();
    const operationName = operation.name;

    if (!operationName) {
      throw new Error("No operation name returned from Veo API");
    }

    // Poll for completion using fetchPredictOperation (max ~5 minutes)
    const pollUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:fetchPredictOperation`;
    let result = null;
    const maxAttempts = 60; // 60 * 5s = 300s

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 5000));

      const pollRes = await fetch(pollUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ operationName }),
      });

      if (!pollRes.ok) {
        const pollErr = await pollRes.text();
        console.error("Poll error:", pollErr);
        continue;
      }

      const pollData = await pollRes.json();

      if (pollData.done) {
        if (pollData.error) {
          throw new Error(`Video generation failed: ${JSON.stringify(pollData.error)}`);
        }
        result = pollData.response;
        break;
      }
    }

    if (!result) {
      throw new Error("Video generation timed out after 5 minutes");
    }

    console.log("Veo response structure:", JSON.stringify(result).substring(0, 500));

    // Extract video data - Veo returns various nested formats
    const generatedVideos =
      result.videos ||
      result.generateVideoResponse?.generatedSamples ||
      result.predictions ||
      result.generatedSamples ||
      [];

    if (generatedVideos.length === 0) {
      if (result.raiMediaFilteredCount && result.raiMediaFilteredCount > 0) {
        throw new Error("Video was blocked by safety filters. Try a gentler prompt.");
      }
      throw new Error("No video generated in the response. Keys: " + Object.keys(result).join(", "));
    }

    const videoData = generatedVideos[0];
    let videoBytes: Uint8Array;

    if (videoData.bytesBase64Encoded || videoData.video?.bytesBase64Encoded) {
      // Video returned as base64
      const b64 = videoData.bytesBase64Encoded || videoData.video.bytesBase64Encoded;
      const binaryString = atob(b64);
      videoBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        videoBytes[i] = binaryString.charCodeAt(i);
      }
    } else if (videoData.gcsUri || videoData.uri || videoData.video?.uri || videoData.video?.gcsUri) {
      // Video stored in GCS (or direct URI), need to download it
      const sourceUri = videoData.gcsUri || videoData.uri || videoData.video?.uri || videoData.video?.gcsUri;

      const downloadUrl = sourceUri.startsWith("gs://")
        ? (() => {
            const gcsPath = sourceUri.replace("gs://", "");
            const bucket = gcsPath.split("/")[0];
            const objectPath = gcsPath.split("/").slice(1).join("/");
            return `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(objectPath)}?alt=media`;
          })()
        : sourceUri;

      const gcsRes = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!gcsRes.ok) throw new Error(`Failed to download video from source URI: ${gcsRes.status}`);
      videoBytes = new Uint8Array(await gcsRes.arrayBuffer());
    } else {
      throw new Error("Unexpected video response format");
    }

    // Upload to Supabase Storage
    const fileName = `${user.id}/${dreamId}-${Date.now()}.mp4`;
    const { error: uploadError } = await supabase.storage
      .from("dream-videos")
      .upload(fileName, videoBytes, {
        contentType: "video/mp4",
        upsert: true,
      });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: publicUrl } = supabase.storage
      .from("dream-videos")
      .getPublicUrl(fileName);

    // Update dream entry
    const { error: updateError } = await supabase
      .from("dream_entries")
      .update({ video_url: publicUrl.publicUrl })
      .eq("id", dreamId)
      .eq("user_id", user.id);

    if (updateError) throw new Error(`Failed to update dream: ${updateError.message}`);

    return new Response(
      JSON.stringify({ videoUrl: publicUrl.publicUrl }),
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
