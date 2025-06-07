
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FlagNotificationRequest {
  flagId: string;
  contentType: 'dream' | 'comment';
  contentId: string;
  reason: string;
  additionalNotes?: string;
  reporterEmail: string;
  contentOwnerId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { flagId, contentType, contentId, reason, additionalNotes, reporterEmail, contentOwnerId }: FlagNotificationRequest = await req.json();

    // Get content details
    let contentPreview = '';
    let contentTitle = '';
    let contentOwnerEmail = '';

    if (contentType === 'dream') {
      const { data: dream } = await supabaseClient
        .from('dream_entries')
        .select('title, content')
        .eq('id', contentId)
        .single();
      
      if (dream) {
        contentTitle = dream.title;
        contentPreview = dream.content.substring(0, 200) + (dream.content.length > 200 ? '...' : '');
      }
    } else if (contentType === 'comment') {
      const { data: comment } = await supabaseClient
        .from('dream_comments')
        .select('content')
        .eq('id', contentId)
        .single();
      
      if (comment) {
        contentTitle = 'Comment';
        contentPreview = comment.content.substring(0, 200) + (comment.content.length > 200 ? '...' : '');
      }
    }

    // Get content owner profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('display_name')
      .eq('id', contentOwnerId)
      .single();

    const contentOwnerName = profile?.display_name || 'Unknown User';

    // Send notification email to your verified email address
    const emailResponse = await resend.emails.send({
      from: "Content Moderation <onboarding@resend.dev>",
      to: ["lucidrepofficial@gmail.com"],
      subject: `🚩 Content Flagged - ${reason}`,
      html: `
        <h2>Content Flagged for Review</h2>
        <p><strong>Flag ID:</strong> ${flagId}</p>
        <p><strong>Content Type:</strong> ${contentType}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Reporter:</strong> ${reporterEmail}</p>
        <p><strong>Content Owner:</strong> ${contentOwnerName}</p>
        
        <h3>Content Details:</h3>
        <p><strong>Title:</strong> ${contentTitle}</p>
        <p><strong>Preview:</strong></p>
        <blockquote style="background: #f5f5f5; padding: 10px; border-left: 3px solid #ccc;">
          ${contentPreview}
        </blockquote>
        
        ${additionalNotes ? `
        <h3>Additional Notes from Reporter:</h3>
        <p>${additionalNotes}</p>
        ` : ''}
        
        <hr>
        <p>Please review this content and take appropriate action.</p>
      `,
    });

    console.log("Flag notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-flag-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
