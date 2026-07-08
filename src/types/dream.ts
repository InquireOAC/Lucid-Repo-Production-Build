
export interface DreamEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
  mood?: string;
  lucid: boolean;
  user_id?: string;
  userId?: string;
  analysis?: string;
  generatedImage?: string;
  image_url?: string;
  imagePrompt?: string;
  image_prompt?: string;
  is_public?: boolean;
  isPublic?: boolean;
  like_count?: number;
  likeCount?: number;
  comment_count?: number;
  commentCount?: number;
  view_count?: number; // Added missing property
  liked?: boolean;
  created_at?: string; // Added missing property
  profiles?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
    avatar_symbol?: string;
    avatar_color?: string;
  };
  audioUrl?: string;
  audio_url?: string;
  image_dataurl?: string;
  video_url?: string;
  lucidity_level?: number | null;
  technique_used?: string | null;
  dream_symbols?: string[];
  word_count?: number | null;
  dream_date?: string | null;
  section_images?: Array<{
    section: number;
    text: string;
    image_url?: string;
    prompt?: string;
    video_url?: string;
  }>;
  dream_character_ids?: string[];
  is_archived?: boolean;
  /** Lucid Engine cinematic spec — beat sequence + compiled prompt */
  cinematicSpec?: CinematicSpec;
  /** Attached world/environment id from global_environments */
  environmentId?: string;
}

// ============================================================
// Lucid Engine shared types — beat sequences, versioning, worlds
// ============================================================

export type BeatType =
  | 'establishing'
  | 'action'
  | 'emotional'
  | 'transition'
  | 'climax'
  | 'resolution';

export interface BeatDefinition {
  index: number;
  sectionText: string;
  beatType: BeatType;
  durationSeconds: number;
  imageUrl?: string;
  videoUrl?: string;
  prompt?: string;
  /** Video model used to generate this beat's video */
  videoModelId?: string;
  status: 'pending' | 'generating' | 'done' | 'error';
}

export interface CinematicSpec {
  dreamId: string;
  totalDuration: number;
  beats: BeatDefinition[];
  soundBed?: string;
  audioTrackUrl?: string;
  finalVideoUrl?: string;
}

/** Non-destructive versioned frame — mirrors Lucid Engine's shot_versions pattern */
export interface DreamFrameVersion {
  id: string;
  dreamId: string;
  /** Section index (0-based) this frame belongs to */
  frameTarget: number;
  imageUrl: string;
  prompt?: string;
  modelUsed?: string;
  createdAt: string;
  isActive: boolean;
}

/** Dream character reference — forward-compatible with Lucid Engine's character_references */
export interface DreamCharacterReference {
  id: string;
  userId: string;
  name: string;
  photoUrl?: string;
  outfitPhotoUrl?: string;
  accessoryPhotoUrl?: string;
  visualFingerprint?: string;
  /** Lucid Engine LoRA fine-tune ID for visual consistency */
  loraId?: string;
  /** Structured appearance data matching Lucid Engine's appearance_data jsonb */
  appearanceData?: {
    hairColor?: string;
    eyeColor?: string;
    skinTone?: string;
    height?: string;
    build?: string;
    clothingDescription?: string;
    distinguishingFeatures?: string[];
  };
}

/** World/environment entry — mirrors Lucid Engine's global_environments */
export interface GlobalEnvironment {
  id: string;
  userId: string;
  name: string;
  description?: string;
  referenceImageUrl?: string;
  tags: string[];
  createdAt: string;
}

export interface DreamTag {
  id: string;
  name: string;
  color: string;
  user_id?: string;
}

export interface DreamStore {
  entries: DreamEntry[];
  tags: DreamTag[];
}
