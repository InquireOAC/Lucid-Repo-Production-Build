

## Enhance Voice Recording with AI Transcription

### What Changes
When a user records their voice in the dream entry form, the recording will automatically be sent to OpenAI for transcription. The transcribed text becomes the dream description, and the audio recording is also kept and saved alongside it.

### User Experience Flow
1. User taps "Voice" mode and records their dream
2. After stopping the recording, a "Transcribing..." loading state appears
3. The transcribed text auto-populates the dream description field
4. The audio recording preview remains visible for playback
5. User can edit the transcribed text before saving
6. Both the text description and audio file are saved with the dream

### Technical Details

**1. Update `VoiceRecorder` component (`src/components/dreams/VoiceRecorder.tsx`)**
- Add a new `onTranscriptionComplete` callback prop
- After recording stops and `onRecordingComplete` fires, automatically call the `voice-to-text` edge function
- Add a "Transcribing..." loading state with spinner
- Convert the audio blob to base64 and send it to the edge function
- Pass the transcribed text back via the new callback

**2. Update `NewDream` page (`src/pages/NewDream.tsx`)**
- Add `onTranscriptionComplete` handler that sets `formData.content` to the transcribed text (replacing the placeholder "Audio recorded" text)
- Show transcription loading state
- Remove the "Audio recorded" placeholder logic from `handleVoiceRecording`

**3. Update `DreamEntryForm` component (`src/components/DreamEntryForm.tsx`)**
- Same changes as NewDream: handle transcription callback, set content from transcription, remove placeholder text

**4. The existing `voice-to-text` edge function is already deployed and configured** - it uses OpenAI's `gpt-4o-transcribe` model and accepts base64 audio. No backend changes needed.

