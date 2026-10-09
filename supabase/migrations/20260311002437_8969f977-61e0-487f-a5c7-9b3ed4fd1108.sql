CREATE OR REPLACE FUNCTION public.backfill_dream_images()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  image_pool text[];
  imageless_ids uuid[];
  i integer;
  updated_count integer := 0;
  pool_size integer;
BEGIN
  SELECT ARRAY_AGG(DISTINCT image_url) INTO image_pool
  FROM dream_entries
  WHERE image_url IS NOT NULL
    AND image_url LIKE '%mock-seeds%';

  pool_size := array_length(image_pool, 1);
  IF pool_size IS NULL OR pool_size = 0 THEN
    RETURN 0;
  END IF;

  SELECT ARRAY_AGG(id) INTO imageless_ids
  FROM dream_entries
  WHERE is_public = true
    AND image_url IS NULL
    AND "generatedImage" IS NULL;

  IF imageless_ids IS NULL THEN
    RETURN 0;
  END IF;

  FOR i IN 1..array_length(imageless_ids, 1) LOOP
    UPDATE dream_entries
    SET image_url = image_pool[((i - 1) % pool_size) + 1]
    WHERE id = imageless_ids[i];
    updated_count := updated_count + 1;
  END LOOP;

  RETURN updated_count;
END;
$$;