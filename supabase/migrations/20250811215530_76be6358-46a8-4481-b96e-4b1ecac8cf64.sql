-- Update activities table check constraint to include 'message' type
ALTER TABLE public.activities 
DROP CONSTRAINT activities_type_check;

ALTER TABLE public.activities 
ADD CONSTRAINT activities_type_check 
CHECK (type = ANY (ARRAY['comment'::text, 'like'::text, 'follow'::text, 'message'::text]));