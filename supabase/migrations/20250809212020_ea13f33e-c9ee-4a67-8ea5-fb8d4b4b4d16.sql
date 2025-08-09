-- Drop the duplicate foreign key constraint I just added
ALTER TABLE public.dream_entries 
DROP CONSTRAINT IF EXISTS fk_dream_entries_user_id;