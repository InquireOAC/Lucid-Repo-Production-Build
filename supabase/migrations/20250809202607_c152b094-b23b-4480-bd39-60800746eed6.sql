-- Update the existing video to be published
UPDATE video_entries 
SET is_published = true, updated_at = now()
WHERE id = '2fcc7df1-e23c-49a9-a0b1-6ee0d58d0ee1';