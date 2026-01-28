-- ------------------------------------------------------------
-- 1. Add like_count to comments
-- ------------------------------------------------------------
ALTER TABLE public.comments
ADD COLUMN IF NOT EXISTS like_count integer NOT NULL DEFAULT 0;
-- 2. Comment reactions table
CREATE TABLE IF NOT EXISTS public.comment_reactions (
    id bigserial PRIMARY KEY,
    comment_id bigint NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (comment_id, user_id)
);
-- Optional helper indexes for analytics
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id
    ON public.comment_reactions (comment_id);

CREATE INDEX IF NOT EXISTS idx_comment_reactions_user_id
    ON public.comment_reactions (user_id);
-- 2. Trigger function to keep like_count in sync
CREATE OR REPLACE FUNCTION public.update_comment_like_count()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.comments
        SET like_count = COALESCE(like_count, 0) + 1
        WHERE id = NEW.comment_id;
        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.comments
        SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0)
        WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger on comment_reactions

DROP TRIGGER IF EXISTS trigger_update_comment_like_count ON public.comment_reactions;
CREATE TRIGGER trigger_update_comment_like_count
AFTER INSERT OR DELETE
ON public.comment_reactions
FOR EACH ROW
EXECUTE FUNCTION public.update_comment_like_count();

-- 4. Backfill existing counts (optional)
UPDATE public.comments c
SET like_count = sub.cnt
FROM (
    SELECT comment_id, COUNT(*) AS cnt
    FROM public.comment_reactions
    GROUP BY comment_id
) AS sub
WHERE c.id = sub.comment_id;

-- 5. Enable RLS & add policies
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- Users can like (insert) only for themselves
CREATE POLICY "Users can insert their own comment likes"
ON public.comment_reactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove (delete) only their own likes
CREATE POLICY "Users can delete their own comment likes"
ON public.comment_reactions
FOR DELETE
USING (auth.uid() = user_id);

-- Allow read access for everyone (optional)
CREATE POLICY "Allow read access to comment likes"
ON public.comment_reactions
FOR SELECT
USING (true);
