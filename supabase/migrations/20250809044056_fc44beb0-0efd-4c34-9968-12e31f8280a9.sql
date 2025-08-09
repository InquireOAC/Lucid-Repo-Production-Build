-- Add unique constraint on user_id in learning_progress table
ALTER TABLE public.learning_progress 
ADD CONSTRAINT learning_progress_user_id_unique UNIQUE (user_id);