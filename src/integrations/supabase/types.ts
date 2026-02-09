export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string | null
          dream_id: string | null
          id: string
          target_user_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dream_id?: string | null
          id?: string
          target_user_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dream_id?: string | null
          id?: string
          target_user_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_dream_id_fkey"
            columns: ["dream_id"]
            isOneToOne: false
            referencedRelation: "dream_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_context: {
        Row: {
          aesthetic_preferences: string[] | null
          age_range: string | null
          build: string | null
          clothing_style: string | null
          created_at: string
          eye_color: string | null
          hair_color: string | null
          hair_style: string | null
          height: string | null
          id: string
          name: string | null
          photo_url: string | null
          pronouns: string | null
          skin_tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aesthetic_preferences?: string[] | null
          age_range?: string | null
          build?: string | null
          clothing_style?: string | null
          created_at?: string
          eye_color?: string | null
          hair_color?: string | null
          hair_style?: string | null
          height?: string | null
          id?: string
          name?: string | null
          photo_url?: string | null
          pronouns?: string | null
          skin_tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aesthetic_preferences?: string[] | null
          age_range?: string | null
          build?: string | null
          clothing_style?: string | null
          created_at?: string
          eye_color?: string | null
          hair_color?: string | null
          hair_style?: string | null
          height?: string | null
          id?: string
          name?: string | null
          photo_url?: string | null
          pronouns?: string | null
          skin_tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_user_id: string
          blocker_user_id: string
          created_at: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_user_id: string
          blocker_user_id: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_user_id?: string
          blocker_user_id?: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          comment_text: string
          created_at: string | null
          dream_id: string
          id: string
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string | null
          dream_id: string
          id?: string
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string | null
          dream_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_dream_id_fkey"
            columns: ["dream_id"]
            isOneToOne: false
            referencedRelation: "dream_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_flags: {
        Row: {
          additional_notes: string | null
          created_at: string
          flagged_content_id: string
          flagged_content_type: string
          flagged_user_id: string
          id: string
          reason: string
          reporter_user_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          additional_notes?: string | null
          created_at?: string
          flagged_content_id: string
          flagged_content_type: string
          flagged_user_id: string
          id?: string
          reason: string
          reporter_user_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          additional_notes?: string | null
          created_at?: string
          flagged_content_id?: string
          flagged_content_type?: string
          flagged_user_id?: string
          id?: string
          reason?: string
          reporter_user_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      creator_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          content_style: string | null
          created_at: string | null
          display_name: string
          engagement_rate: number | null
          follower_count: number | null
          id: string
          niches: string[] | null
          portfolio_images: string[] | null
          services_offered: string[] | null
          social_links: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          content_style?: string | null
          created_at?: string | null
          display_name: string
          engagement_rate?: number | null
          follower_count?: number | null
          id: string
          niches?: string[] | null
          portfolio_images?: string[] | null
          services_offered?: string[] | null
          social_links?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          content_style?: string | null
          created_at?: string | null
          display_name?: string
          engagement_rate?: number | null
          follower_count?: number | null
          id?: string
          niches?: string[] | null
          portfolio_images?: string[] | null
          services_offered?: string[] | null
          social_links?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          created_at: string
          credits_granted: number
          id: string
          source: string
          timestamp: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_granted: number
          id?: string
          source?: string
          timestamp?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_granted?: number
          id?: string
          source?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_practice_log: {
        Row: {
          completed_at: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          level_id: string | null
          notes: string | null
          path_id: string | null
          practice_type_id: string | null
          user_id: string | null
          xp_earned: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          level_id?: string | null
          notes?: string | null
          path_id?: string | null
          practice_type_id?: string | null
          user_id?: string | null
          xp_earned?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          level_id?: string | null
          notes?: string | null
          path_id?: string | null
          practice_type_id?: string | null
          user_id?: string | null
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_practice_log_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "path_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_practice_log_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_practice_log_practice_type_id_fkey"
            columns: ["practice_type_id"]
            isOneToOne: false
            referencedRelation: "practice_types"
            referencedColumns: ["id"]
          },
        ]
      }
      device_tokens: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dream_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sender: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sender?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dream_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "dream_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      dream_chat_sessions: {
        Row: {
          created_at: string
          expert_type: string
          id: string
          messages: Json | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expert_type: string
          id?: string
          messages?: Json | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expert_type?: string
          id?: string
          messages?: Json | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dream_comments: {
        Row: {
          content: string
          created_at: string
          dream_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          dream_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          dream_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dream_comments_dream_id_fkey"
            columns: ["dream_id"]
            isOneToOne: false
            referencedRelation: "dream_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dream_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dream_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dream_entries: {
        Row: {
          analysis: string | null
          audio_url: string | null
          cbt_analysis: string | null
          comment_count: number | null
          content: string
          created_at: string
          date: string
          favorite_therapy_mode: string | null
          generatedImage: string | null
          id: string
          image_dataurl: string | null
          image_url: string | null
          imagePrompt: string | null
          is_public: boolean | null
          jungian_analysis: string | null
          like_count: number | null
          lucid: boolean | null
          mood: string | null
          shamanic_analysis: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          analysis?: string | null
          audio_url?: string | null
          cbt_analysis?: string | null
          comment_count?: number | null
          content: string
          created_at?: string
          date?: string
          favorite_therapy_mode?: string | null
          generatedImage?: string | null
          id?: string
          image_dataurl?: string | null
          image_url?: string | null
          imagePrompt?: string | null
          is_public?: boolean | null
          jungian_analysis?: string | null
          like_count?: number | null
          lucid?: boolean | null
          mood?: string | null
          shamanic_analysis?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          analysis?: string | null
          audio_url?: string | null
          cbt_analysis?: string | null
          comment_count?: number | null
          content?: string
          created_at?: string
          date?: string
          favorite_therapy_mode?: string | null
          generatedImage?: string | null
          id?: string
          image_dataurl?: string | null
          image_url?: string | null
          imagePrompt?: string | null
          is_public?: boolean | null
          jungian_analysis?: string | null
          like_count?: number | null
          lucid?: boolean | null
          mood?: string | null
          shamanic_analysis?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dream_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dream_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dream_likes: {
        Row: {
          created_at: string | null
          dream_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dream_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dream_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dream_likes_dream_id_fkey"
            columns: ["dream_id"]
            isOneToOne: false
            referencedRelation: "dream_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dream_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dream_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dream_tags: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dream_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dream_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      followers: {
        Row: {
          created_at: string | null
          follower_id: string | null
          following_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          followed_id: string
          follower_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          followed_id: string
          follower_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          followed_id?: string
          follower_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_followed_id_fkey"
            columns: ["followed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_followed_id_fkey"
            columns: ["followed_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_achievements: {
        Row: {
          category: string | null
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          path_id: string | null
          requirement_type: string
          requirement_value: number
          xp_reward: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          path_id?: string | null
          requirement_type: string
          requirement_value: number
          xp_reward?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          path_id?: string | null
          requirement_type?: string
          requirement_value?: number
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "learning_achievements_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_levels: {
        Row: {
          content: Json
          created_at: string
          description: string
          id: string
          level_number: number
          title: string
          xp_required: number
        }
        Insert: {
          content?: Json
          created_at?: string
          description: string
          id?: string
          level_number: number
          title: string
          xp_required?: number
        }
        Update: {
          content?: Json
          created_at?: string
          description?: string
          id?: string
          level_number?: number
          title?: string
          xp_required?: number
        }
        Relationships: []
      }
      learning_paths: {
        Row: {
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          order_index: number
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          icon: string
          id?: string
          name: string
          order_index: number
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          order_index?: number
          title?: string
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          created_at: string
          current_level: number
          current_streak: number
          dream_recall_level: number | null
          dream_recall_xp: number | null
          id: string
          last_activity_date: string | null
          last_practice_date: string | null
          longest_streak: number
          lucid_dreaming_level: number | null
          lucid_dreaming_xp: number | null
          meditation_level: number | null
          meditation_xp: number | null
          obe_level: number | null
          obe_xp: number | null
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          current_streak?: number
          dream_recall_level?: number | null
          dream_recall_xp?: number | null
          id?: string
          last_activity_date?: string | null
          last_practice_date?: string | null
          longest_streak?: number
          lucid_dreaming_level?: number | null
          lucid_dreaming_xp?: number | null
          meditation_level?: number | null
          meditation_xp?: number | null
          obe_level?: number | null
          obe_xp?: number | null
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          current_streak?: number
          dream_recall_level?: number | null
          dream_recall_xp?: number | null
          id?: string
          last_activity_date?: string | null
          last_practice_date?: string | null
          longest_streak?: number
          lucid_dreaming_level?: number | null
          lucid_dreaming_xp?: number | null
          meditation_level?: number | null
          meditation_xp?: number | null
          obe_level?: number | null
          obe_xp?: number | null
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_streaks: {
        Row: {
          activities_completed: number
          created_at: string
          id: string
          streak_date: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          activities_completed?: number
          created_at?: string
          id?: string
          streak_date: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          activities_completed?: number
          created_at?: string
          id?: string
          streak_date?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      lesson_completions: {
        Row: {
          completed_at: string | null
          id: string
          lesson_id: string
          lesson_type: string
          level_id: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          lesson_id: string
          lesson_type: string
          level_id?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          lesson_id?: string
          lesson_type?: string
          level_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_completions_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "path_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string | null
          dream_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dream_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          dream_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_dream_id_fkey"
            columns: ["dream_id"]
            isOneToOne: false
            referencedRelation: "dream_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean | null
          receiver_id: string
          sender_id: string
          shared_dream_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
          shared_dream_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
          shared_dream_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_shared_dream_id_fkey"
            columns: ["shared_dream_id"]
            isOneToOne: false
            referencedRelation: "dream_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          comment_notifications_enabled: boolean
          created_at: string
          daily_reminder_enabled: boolean
          daily_reminder_time: string
          id: string
          message_notifications_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          comment_notifications_enabled?: boolean
          created_at?: string
          daily_reminder_enabled?: boolean
          daily_reminder_time?: string
          id?: string
          message_notifications_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          comment_notifications_enabled?: boolean
          created_at?: string
          daily_reminder_enabled?: boolean
          daily_reminder_time?: string
          id?: string
          message_notifications_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      path_levels: {
        Row: {
          content: Json
          created_at: string | null
          description: string
          id: string
          level_number: number
          path_id: string | null
          title: string
          xp_required: number
        }
        Insert: {
          content?: Json
          created_at?: string | null
          description: string
          id?: string
          level_number: number
          path_id?: string | null
          title: string
          xp_required?: number
        }
        Update: {
          content?: Json
          created_at?: string | null
          description?: string
          id?: string
          level_number?: number
          path_id?: string | null
          title?: string
          xp_required?: number
        }
        Relationships: [
          {
            foreignKeyName: "path_levels_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_sessions: {
        Row: {
          completed_at: string
          duration_minutes: number | null
          id: string
          level_id: string | null
          session_type: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          completed_at?: string
          duration_minutes?: number | null
          id?: string
          level_id?: string | null
          session_type: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          completed_at?: string
          duration_minutes?: number | null
          id?: string
          level_id?: string | null
          session_type?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "practice_sessions_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "learning_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_types: {
        Row: {
          category: string
          created_at: string | null
          display_name: string
          id: string
          name: string
          requires_timer: boolean | null
          xp_reward: number
        }
        Insert: {
          category: string
          created_at?: string | null
          display_name: string
          id?: string
          name: string
          requires_timer?: boolean | null
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string | null
          display_name?: string
          id?: string
          name?: string
          requires_timer?: boolean | null
          xp_reward?: number
        }
        Relationships: []
      }
      pricing_tiers: {
        Row: {
          created_at: string | null
          creator_id: string
          description: string | null
          duration_days: number | null
          id: string
          platforms: string[] | null
          price: number
          tier_name: string
          updated_at: string | null
          usage_type: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          description?: string | null
          duration_days?: number | null
          id?: string
          platforms?: string[] | null
          price: number
          tier_name: string
          updated_at?: string | null
          usage_type?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          description?: string | null
          duration_days?: number | null
          id?: string
          platforms?: string[] | null
          price?: number
          tier_name?: string
          updated_at?: string | null
          usage_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_tiers_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          available_credits: number
          avatar_color: string | null
          avatar_symbol: string | null
          avatar_url: string | null
          banner_image: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          is_subscribed: boolean | null
          profile_picture: string | null
          social_links: Json | null
          updated_at: string
          username: string | null
        }
        Insert: {
          age?: number | null
          available_credits?: number
          avatar_color?: string | null
          avatar_symbol?: string | null
          avatar_url?: string | null
          banner_image?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          is_subscribed?: boolean | null
          profile_picture?: string | null
          social_links?: Json | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          age?: number | null
          available_credits?: number
          avatar_color?: string | null
          avatar_symbol?: string | null
          avatar_url?: string | null
          banner_image?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_subscribed?: boolean | null
          profile_picture?: string | null
          social_links?: Json | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      public_dream_tags: {
        Row: {
          color: string
          id: string
          name: string
        }
        Insert: {
          color?: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      stripe_customers: {
        Row: {
          created_at: string | null
          customer_id: string
          deleted_at: string | null
          id: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          deleted_at?: string | null
          id?: never
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          deleted_at?: string | null
          id?: never
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stripe_orders: {
        Row: {
          amount_subtotal: number
          amount_total: number
          checkout_session_id: string
          created_at: string | null
          currency: string
          customer_id: string
          deleted_at: string | null
          id: number
          payment_intent_id: string
          payment_status: string
          status: Database["public"]["Enums"]["stripe_order_status"]
          updated_at: string | null
        }
        Insert: {
          amount_subtotal: number
          amount_total: number
          checkout_session_id: string
          created_at?: string | null
          currency: string
          customer_id: string
          deleted_at?: string | null
          id?: never
          payment_intent_id: string
          payment_status: string
          status?: Database["public"]["Enums"]["stripe_order_status"]
          updated_at?: string | null
        }
        Update: {
          amount_subtotal?: number
          amount_total?: number
          checkout_session_id?: string
          created_at?: string | null
          currency?: string
          customer_id?: string
          deleted_at?: string | null
          id?: never
          payment_intent_id?: string
          payment_status?: string
          status?: Database["public"]["Enums"]["stripe_order_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      stripe_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: number | null
          current_period_start: number | null
          customer_id: string
          deleted_at: string | null
          dream_analyses_used: number | null
          id: number
          image_generations_used: number | null
          payment_method_brand: string | null
          payment_method_last4: string | null
          price_id: string | null
          status: Database["public"]["Enums"]["stripe_subscription_status"]
          subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: number | null
          current_period_start?: number | null
          customer_id: string
          deleted_at?: string | null
          dream_analyses_used?: number | null
          id?: never
          image_generations_used?: number | null
          payment_method_brand?: string | null
          payment_method_last4?: string | null
          price_id?: string | null
          status: Database["public"]["Enums"]["stripe_subscription_status"]
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: number | null
          current_period_start?: number | null
          customer_id?: string
          deleted_at?: string | null
          dream_analyses_used?: number | null
          id?: never
          image_generations_used?: number | null
          payment_method_brand?: string | null
          payment_method_last4?: string | null
          price_id?: string | null
          status?: Database["public"]["Enums"]["stripe_subscription_status"]
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          active: boolean | null
          analysis_credits_used: number | null
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          image_credits_used: number | null
          plan: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          analysis_credits_used?: number | null
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          image_credits_used?: number | null
          plan: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          analysis_credits_used?: number | null
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          image_credits_used?: number | null
          plan?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      terms_acceptance: {
        Row: {
          accepted_at: string
          created_at: string
          id: string
          ip_address: string | null
          terms_version: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          terms_version?: string
          user_id: string
        }
        Update: {
          accepted_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          terms_version?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "learning_achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_path_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_level: number
          id: string
          is_unlocked: boolean | null
          path_id: string | null
          updated_at: string | null
          user_id: string | null
          xp_earned: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_level?: number
          id?: string
          is_unlocked?: boolean | null
          path_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          xp_earned?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_level?: number
          id?: string
          is_unlocked?: boolean | null
          path_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_path_progress_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      user_public_map: {
        Row: {
          created_at: string | null
          email: string | null
          id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_comments: {
        Row: {
          comment_text: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          video_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          video_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_video_comments_video_id"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      video_entries: {
        Row: {
          comment_count: number | null
          created_at: string
          created_by: string | null
          description: string | null
          dreamer_story_name: string
          duration: number | null
          id: string
          is_published: boolean
          like_count: number | null
          published_at: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          view_count: number | null
          youtube_id: string
          youtube_url: string
        }
        Insert: {
          comment_count?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dreamer_story_name: string
          duration?: number | null
          id?: string
          is_published?: boolean
          like_count?: number | null
          published_at?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          view_count?: number | null
          youtube_id: string
          youtube_url: string
        }
        Update: {
          comment_count?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dreamer_story_name?: string
          duration?: number | null
          id?: string
          is_published?: boolean
          like_count?: number | null
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          view_count?: number | null
          youtube_id?: string
          youtube_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_color: string | null
          avatar_symbol: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string | null
          username: string | null
        }
        Insert: {
          avatar_color?: string | null
          avatar_symbol?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          username?: string | null
        }
        Update: {
          avatar_color?: string | null
          avatar_symbol?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      stripe_user_orders: {
        Row: {
          amount_subtotal: number | null
          amount_total: number | null
          checkout_session_id: string | null
          currency: string | null
          customer_id: string | null
          order_date: string | null
          order_id: number | null
          order_status:
            | Database["public"]["Enums"]["stripe_order_status"]
            | null
          payment_intent_id: string | null
          payment_status: string | null
        }
        Relationships: []
      }
      stripe_user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          current_period_end: number | null
          current_period_start: number | null
          customer_id: string | null
          payment_method_brand: string | null
          payment_method_last4: string | null
          price_id: string | null
          subscription_id: string | null
          subscription_status:
            | Database["public"]["Enums"]["stripe_subscription_status"]
            | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_subscription_credits: {
        Args: { credit_type: string; customer_id: string }
        Returns: boolean
      }
      create_activity: {
        Args: {
          activity_type: string
          dream_id_param?: string
          target_user_id_param: string
          user_id_param: string
        }
        Returns: undefined
      }
      delete_user_account: {
        Args: { user_id_to_delete: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_subscription_usage: {
        Args: { credit_type: string; customer_id: string }
        Returns: undefined
      }
      increment_subscription_usage_by_user: {
        Args: { credit_type: string; user_id_param: string }
        Returns: undefined
      }
      reset_subscription_usage: { Args: never; Returns: undefined }
      update_learning_streak_and_xp: {
        Args: { p_user_id: string; p_xp_to_add: number }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      stripe_order_status: "pending" | "completed" | "canceled"
      stripe_subscription_status:
        | "not_started"
        | "incomplete"
        | "incomplete_expired"
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "unpaid"
        | "paused"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      stripe_order_status: ["pending", "completed", "canceled"],
      stripe_subscription_status: [
        "not_started",
        "incomplete",
        "incomplete_expired",
        "trialing",
        "active",
        "past_due",
        "canceled",
        "unpaid",
        "paused",
      ],
    },
  },
} as const
