-- Check if voice-to-text function needs to be deployed
-- First let's check storage policies for dream-audio bucket
SELECT tablename, schemaname, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
AND policyname LIKE '%dream-audio%';