-- Admin Deployment System: announcements + events + challenges + engagement
-- Adds image_url, tags, scheduling/draft, CTA, notify flag to existing tables.
-- Creates community_events, event_rsvps, engagement_events, broadcast_dismissals.
-- Adds RPCs for engagement recording + aggregation.

-- ─── platform_announcements augmentation ─────────────────────────────────────
ALTER TABLE public.platform_announcements
  ADD COLUMN IF NOT EXISTS image_url    TEXT    NULL,
  ADD COLUMN IF NOT EXISTS tags         TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notify_users BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS cta_label    TEXT    NULL,
  ADD COLUMN IF NOT EXISTS status       TEXT    NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft','published','archived'));
CREATE INDEX IF NOT EXISTS idx_platform_announcements_tags
  ON public.platform_announcements USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_platform_announcements_status
  ON public.platform_announcements (status);

-- ─── community_challenges augmentation ───────────────────────────────────────
ALTER TABLE public.community_challenges
  ADD COLUMN IF NOT EXISTS tags         TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notify_users BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS cta_label    TEXT    NULL;
CREATE INDEX IF NOT EXISTS idx_community_challenges_tags
  ON public.community_challenges USING gin (tags);

-- ─── community_events (new) ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  banner_image_url  TEXT,
  link_url          TEXT,
  cta_label         TEXT,
  location          TEXT,
  starts_at         TIMESTAMPTZ NOT NULL,
  ends_at           TIMESTAMPTZ NOT NULL,
  tags              TEXT[] NOT NULL DEFAULT '{}',
  status            TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','published','ended','archived')),
  notify_users      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS idx_community_events_starts
  ON public.community_events (starts_at);
CREATE INDEX IF NOT EXISTS idx_community_events_tags
  ON public.community_events USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_community_events_status
  ON public.community_events (status);

ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage events"
  ON public.community_events FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view published events"
  ON public.community_events FOR SELECT
  USING (status = 'published' AND ends_at > now());

-- ─── event_rsvps (new) ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES public.community_events(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rsvp_status TEXT NOT NULL DEFAULT 'going'
    CHECK (rsvp_status IN ('going','interested','declined')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON public.event_rsvps (event_id);

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own RSVPs"
  ON public.event_rsvps FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins read RSVPs"
  ON public.event_rsvps FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ─── engagement_events (new) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.engagement_events (
  id           BIGSERIAL PRIMARY KEY,
  entity_type  TEXT NOT NULL CHECK (entity_type IN ('announcement','event','challenge')),
  entity_id    UUID NOT NULL,
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action       TEXT NOT NULL CHECK (action IN ('view','click','dismiss','rsvp','enter','share')),
  metadata     JSONB DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_engagement_entity
  ON public.engagement_events (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_engagement_action
  ON public.engagement_events (action);
CREATE INDEX IF NOT EXISTS idx_engagement_created
  ON public.engagement_events (created_at);

ALTER TABLE public.engagement_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert their own engagement"
  ON public.engagement_events FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admins read engagement"
  ON public.engagement_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ─── broadcast_dismissals (new, unified for announcements+events+challenges) ─
CREATE TABLE IF NOT EXISTS public.broadcast_dismissals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type   TEXT NOT NULL CHECK (entity_type IN ('announcement','event','challenge')),
  entity_id     UUID NOT NULL,
  dismissed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, entity_type, entity_id)
);

ALTER TABLE public.broadcast_dismissals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own dismissals"
  ON public.broadcast_dismissals FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── RPC: record_engagement ──────────────────────────────────────────────────
-- Records a single engagement event from the current user.
-- For `view` action, dedupes to one row per user per entity per UTC day.
CREATE OR REPLACE FUNCTION public.record_engagement(
  p_entity_type TEXT,
  p_entity_id   UUID,
  p_action      TEXT,
  p_metadata    JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
BEGIN
  IF p_action = 'view' AND v_user IS NOT NULL THEN
    -- Dedup views: one per user/entity/day
    IF EXISTS (
      SELECT 1 FROM public.engagement_events
      WHERE entity_type = p_entity_type
        AND entity_id = p_entity_id
        AND user_id = v_user
        AND action = 'view'
        AND created_at::date = (now() at time zone 'utc')::date
    ) THEN
      RETURN;
    END IF;
  END IF;

  INSERT INTO public.engagement_events (entity_type, entity_id, user_id, action, metadata)
  VALUES (p_entity_type, p_entity_id, v_user, p_action, COALESCE(p_metadata, '{}'::jsonb));
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_engagement(TEXT, UUID, TEXT, JSONB) TO authenticated, anon;

-- ─── RPC: get_engagement_stats ───────────────────────────────────────────────
-- Returns aggregated engagement metrics for a single entity. Admin only.
CREATE OR REPLACE FUNCTION public.get_engagement_stats(
  p_entity_type TEXT,
  p_entity_id   UUID
)
RETURNS TABLE (
  views          BIGINT,
  unique_views   BIGINT,
  clicks         BIGINT,
  dismissals     BIGINT,
  rsvps          BIGINT,
  entries        BIGINT,
  shares         BIGINT,
  ctr            NUMERIC,
  dismiss_rate   NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_views BIGINT;
  v_unique BIGINT;
  v_clicks BIGINT;
  v_dismiss BIGINT;
  v_rsvps BIGINT;
  v_entries BIGINT;
  v_shares BIGINT;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT
    COUNT(*) FILTER (WHERE action = 'view'),
    COUNT(DISTINCT user_id) FILTER (WHERE action = 'view'),
    COUNT(*) FILTER (WHERE action = 'click'),
    COUNT(*) FILTER (WHERE action = 'dismiss'),
    COUNT(*) FILTER (WHERE action = 'rsvp'),
    COUNT(*) FILTER (WHERE action = 'enter'),
    COUNT(*) FILTER (WHERE action = 'share')
  INTO v_views, v_unique, v_clicks, v_dismiss, v_rsvps, v_entries, v_shares
  FROM public.engagement_events
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id;

  -- Backfill entries from challenge_entries / event_rsvps if engagement_events didn't capture them
  IF p_entity_type = 'challenge' THEN
    SELECT COUNT(*) INTO v_entries
    FROM public.challenge_entries WHERE challenge_id = p_entity_id;
  ELSIF p_entity_type = 'event' THEN
    SELECT COUNT(*) INTO v_rsvps
    FROM public.event_rsvps
    WHERE event_id = p_entity_id AND rsvp_status IN ('going','interested');
  END IF;

  RETURN QUERY SELECT
    v_views,
    v_unique,
    v_clicks,
    v_dismiss,
    v_rsvps,
    v_entries,
    v_shares,
    CASE WHEN v_views > 0 THEN ROUND(v_clicks::numeric / v_views::numeric, 4) ELSE 0 END,
    CASE WHEN v_views > 0 THEN ROUND(v_dismiss::numeric / v_views::numeric, 4) ELSE 0 END;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_engagement_stats(TEXT, UUID) TO authenticated;

-- ─── Storage bucket: admin-banners ───────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-banners', 'admin-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for admin-banners (idempotent)
DROP POLICY IF EXISTS "Admins upload to admin-banners"  ON storage.objects;
DROP POLICY IF EXISTS "Admins update admin-banners"     ON storage.objects;
DROP POLICY IF EXISTS "Admins delete admin-banners"     ON storage.objects;
DROP POLICY IF EXISTS "Anyone reads admin-banners"      ON storage.objects;

CREATE POLICY "Admins upload to admin-banners"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'admin-banners' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update admin-banners"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'admin-banners' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete admin-banners"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'admin-banners' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone reads admin-banners"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'admin-banners');
