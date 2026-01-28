-- Add media column to comments table
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS media jsonb DEFAULT NULL;

-- Make text nullable (can be empty if media is present)
ALTER TABLE public.comments 
ALTER COLUMN text DROP NOT NULL;

-- Add index for media queries if needed
CREATE INDEX IF NOT EXISTS idx_comments_media ON public.comments USING gin (media);

