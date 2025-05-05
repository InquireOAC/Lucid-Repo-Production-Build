
export type DreamTag = {
  id: string;
  name: string;
  color: string;
};

export type DreamEntry = {
  id: string;
  date: string; // ISO string
  title: string;
  content: string;
  tags: string[]; // Array of tag IDs
  mood?: string;
  lucid: boolean;
  imagePrompt?: string;
  generatedImage?: string;
  analysis?: string;
  is_public?: boolean; // Whether dream is shared to Lucid Repo
  isPublic?: boolean; // Legacy field - keeping for backward compatibility
  like_count?: number; // Supabase field name
  likeCount?: number; // App field name
  comment_count?: number; // Supabase field name
  commentCount?: number; // App field name
  created_at?: string; // Added for Supabase timestamp
  updated_at?: string; // Added for Supabase timestamp
  user_id?: string; // Added for Supabase user ID
  view_count?: number; // Added for Supabase view count
  // Add profiles field for joined queries
  profiles?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
};

export type DreamStore = {
  entries: DreamEntry[];
  tags: DreamTag[];
};

export type SocialLinks = {
  twitter?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
};
