export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
        ]
      }
      dream_entries: {
        Row: {
          analysis: string | null
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
            foreignKeyName: "followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
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
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      profiles: {
        Row: {
          age: number | null
          available_credits: number
          avatar_color: string | null
          avatar_symbol: string | null
          avatar_url: string | null
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
    }
    Views: {
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
        Args: { customer_id: string; credit_type: string }
        Returns: boolean
      }
      delete_user_account: {
        Args: { user_id_to_delete: string }
        Returns: undefined
      }
      increment_subscription_usage: {
        Args: { customer_id: string; credit_type: string }
        Returns: undefined
      }
      reset_subscription_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
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
