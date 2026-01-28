-- Add comments_count column to telegram_posts table
ALTER TABLE public.telegram_posts
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_telegram_posts_comments_count ON public.telegram_posts(comments_count);

-- Function to update comments count
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment count on new comment
    UPDATE telegram_posts
    SET comments_count = COALESCE(comments_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement count on comment deletion
    UPDATE telegram_posts
    SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on comments table
DROP TRIGGER IF EXISTS trigger_update_comments_count ON public.comments;
CREATE TRIGGER trigger_update_comments_count
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION update_comments_count();

-- Initialize existing counts (run once)
UPDATE telegram_posts tp
SET comments_count = (
  SELECT COUNT(*)
  FROM comments c
  WHERE c.post_id = tp.id
);

