
export interface SocialProfile {
  id: string;
  username: string;
  bio: string;
  profile_picture: string;
  is_subscribed: boolean;
}
export interface SocialDream {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url?: string;
  tags?: string[];
  is_public: boolean;
  created_at: string;
  like_count?: number;
  profiles?: SocialProfile;
}
export interface SocialFollow {
  id: string;
  follower_id: string;
  followed_id: string;
  created_at: string;
}
export interface SocialLike {
  id: string;
  user_id: string;
  dream_id: string;
  created_at: string;
}
export interface SocialComment {
  id: string;
  user_id: string;
  dream_id: string;
  comment_text: string;
  created_at: string;
  profiles?: SocialProfile;
}
