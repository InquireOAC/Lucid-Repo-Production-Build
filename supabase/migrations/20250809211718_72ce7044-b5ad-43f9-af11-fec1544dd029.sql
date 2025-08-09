-- Add foreign key relationship between dream_entries and profiles
-- This will allow proper joins to work for fetching user data with dreams
ALTER TABLE public.dream_entries 
ADD CONSTRAINT fk_dream_entries_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) 
ON DELETE CASCADE;