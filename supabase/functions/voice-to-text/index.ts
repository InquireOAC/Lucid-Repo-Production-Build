import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB limit

// Decode base64 string to Uint8Array
function decodeBase64(base64String: string): Uint8Array {
  const binaryString = atob(base64String);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio, mimeType: clientMimeType } = await req.json();
    
    // Input validation
    if (!audio || typeof audio !== 'string') {
      throw new Error('No audio data provided');
    }

    // Validate audio size (base64 encoded size)
    const estimatedSize = (audio.length * 3) / 4;
    if (estimatedSize > MAX_AUDIO_SIZE) {
      throw new Error(`Audio file too large. Maximum ${MAX_AUDIO_SIZE / 1024 / 1024}MB allowed.`);
    }

    // Determine MIME type and file extension
    const mimeType = clientMimeType || 'audio/webm';
    let fileExtension = 'webm';
    if (mimeType.includes('mp4') || mimeType.includes('m4a')) {
      fileExtension = 'mp4';
    } else if (mimeType.includes('ogg')) {
      fileExtension = 'ogg';
    } else if (mimeType.includes('aac')) {
      fileExtension = 'aac';
    } else if (mimeType.includes('wav')) {
      fileExtension = 'wav';
    }

    console.log(`Processing voice-to-text, estimated size: ${(estimatedSize / 1024 / 1024).toFixed(2)}MB, mimeType: ${mimeType}, ext: ${fileExtension}`);

    // Decode audio from base64
    const binaryAudio = decodeBase64(audio);
    
    // Prepare form data for OpenAI transcription
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: mimeType });
    formData.append('file', blob, `audio.${fileExtension}`);
    formData.append('model', 'gpt-4o-transcribe');

    console.log('Sending to OpenAI Whisper API...');

    // Send to OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Transcription successful:', result.text?.substring(0, 100) + '...');

    return new Response(
      JSON.stringify({ 
        text: result.text,
        success: true 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Voice-to-text error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});