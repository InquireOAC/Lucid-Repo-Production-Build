
-- dream_matches: paired similar dreams
CREATE TABLE public.dream_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dream1_id uuid NOT NULL REFERENCES public.dream_entries(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dream2_id uuid NOT NULL REFERENCES public.dream_entries(id) ON DELETE CASCADE,
  match_percentage integer NOT NULL DEFAULT 0,
  shared_elements text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dream_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own matches" ON public.dream_matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- sync_alerts: 5+ dreamers same theme in 48h
CREATE TABLE public.sync_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme text NOT NULL,
  emoji text DEFAULT '🔗',
  description text,
  dreamer_count integer NOT NULL DEFAULT 0,
  dreamer_ids uuid[] DEFAULT '{}',
  is_trending boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sync_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sync alerts" ON public.sync_alerts
  FOR SELECT TO authenticated USING (true);

-- collective_waves: 15+ dreamers same theme in 72h
CREATE TABLE public.collective_waves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme text NOT NULL,
  emoji text DEFAULT '🌊',
  description text,
  dream_count integer NOT NULL DEFAULT 0,
  percent_change integer DEFAULT 0,
  top_symbols text[] DEFAULT '{}',
  timeframe_start timestamptz NOT NULL DEFAULT now(),
  timeframe_end timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.collective_waves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view collective waves" ON public.collective_waves
  FOR SELECT TO authenticated USING (true);

-- dream_clusters: admin-created event correlations
CREATE TABLE public.dream_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  emoji text DEFAULT '🌕',
  event_date date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  dream_count integer NOT NULL DEFAULT 0,
  top_themes text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dream_clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view dream clusters" ON public.dream_clusters
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage dream clusters" ON public.dream_clusters
  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger function: match dreams on insert
CREATE OR REPLACE FUNCTION public.match_dream_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  other_dream RECORD;
  shared text[];
  total_unique integer;
  pct integer;
  tag_name text;
  tag_count integer;
  distinct_dreamers integer;
BEGIN
  -- Only process if dream has tags
  IF NEW.tags IS NULL OR array_length(NEW.tags, 1) IS NULL THEN
    RETURN NEW;
  END IF;

  -- Find matching public dreams from other users in last 7 days
  FOR other_dream IN
    SELECT id, user_id, tags
    FROM dream_entries
    WHERE is_public = true
      AND user_id != NEW.user_id
      AND created_at > now() - interval '7 days'
      AND tags IS NOT NULL
      AND array_length(tags, 1) > 0
      AND id != NEW.id
  LOOP
    -- Compute shared tags
    shared := ARRAY(SELECT unnest(NEW.tags) INTERSECT SELECT unnest(other_dream.tags));
    
    IF array_length(shared, 1) >= 2 THEN
      -- Compute match percentage
      total_unique := (SELECT count(DISTINCT t) FROM (SELECT unnest(NEW.tags) AS t UNION SELECT unnest(other_dream.tags) AS t) sub);
      IF total_unique > 0 THEN
        pct := (array_length(shared, 1) * 100) / total_unique;
      ELSE
        pct := 0;
      END IF;

      -- Check no duplicate match exists
      IF NOT EXISTS (
        SELECT 1 FROM dream_matches
        WHERE (dream1_id = NEW.id AND dream2_id = other_dream.id)
           OR (dream1_id = other_dream.id AND dream2_id = NEW.id)
      ) THEN
        INSERT INTO dream_matches (user1_id, dream1_id, user2_id, dream2_id, match_percentage, shared_elements)
        VALUES (NEW.user_id, NEW.id, other_dream.user_id, other_dream.id, pct, shared);
      END IF;
    END IF;
  END LOOP;

  -- Check for sync alerts: 5+ public dreams with same tag in 48h
  FOREACH tag_name IN ARRAY NEW.tags
  LOOP
    SELECT count(DISTINCT user_id) INTO distinct_dreamers
    FROM dream_entries
    WHERE is_public = true
      AND created_at > now() - interval '48 hours'
      AND tag_name = ANY(tags);

    IF distinct_dreamers >= 5 THEN
      -- Upsert sync alert
      INSERT INTO sync_alerts (theme, emoji, description, dreamer_count, is_trending)
      VALUES (
        tag_name,
        '🔗',
        distinct_dreamers || ' dreamers experienced ' || tag_name || ' dreams in the last 48 hours',
        distinct_dreamers,
        distinct_dreamers >= 10
      )
      ON CONFLICT DO NOTHING;
    END IF;

    -- Check for collective waves: 15+ public dreams with same tag in 72h
    IF distinct_dreamers >= 15 THEN
      SELECT count(*) INTO tag_count
      FROM dream_entries
      WHERE is_public = true
        AND created_at > now() - interval '72 hours'
        AND tag_name = ANY(tags);

      INSERT INTO collective_waves (theme, emoji, description, dream_count, timeframe_start, timeframe_end, top_symbols)
      VALUES (
        tag_name,
        '🌊',
        'A surge of ' || tag_name || ' dreams swept through the community',
        tag_count,
        now() - interval '72 hours',
        now(),
        ARRAY[tag_name]
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_match_dream_on_insert
  AFTER INSERT ON public.dream_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.match_dream_on_insert();
