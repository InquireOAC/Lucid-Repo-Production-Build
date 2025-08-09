export interface VideoEntry {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  dreamer_story_name: string;
  duration?: number;
  created_at: string;
  view_count?: number;
  like_count?: number;
}