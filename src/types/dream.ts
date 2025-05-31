
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
