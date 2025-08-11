-- Add dream sharing capability to messages
ALTER TABLE public.messages 
ADD COLUMN shared_dream_id uuid REFERENCES public.dream_entries(id) ON DELETE SET NULL;

-- Add index for better performance when querying messages with shared dreams
CREATE INDEX idx_messages_shared_dream_id ON public.messages(shared_dream_id) WHERE shared_dream_id IS NOT NULL;