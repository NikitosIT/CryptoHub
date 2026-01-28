CREATE OR REPLACE FUNCTION public.fetch_telegram_posts(
  cursor_id bigint DEFAULT NULL,
  cursor_created_at timestamptz DEFAULT NULL,
  page_limit integer DEFAULT 10,
  mode text DEFAULT 'all',
  author_id bigint DEFAULT NULL,
  token_name text DEFAULT NULL
)
RETURNS TABLE (
  id bigint,
  media_group_id text,
  text_caption text,
  text_entities jsonb,
  crypto_tokens text[],
  tg_author_id bigint,
  media jsonb,
  created_at timestamptz,
  author_name text,
  author_link text,
  like_count integer,
  dislike_count integer,
  comments_count integer,
  user_reaction text,
  is_favorite boolean
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
SELECT
  p.id,
  p.media_group_id,
  p.text_caption,
  p.text_entities,
  p.crypto_tokens,
  p.tg_author_id,
  p.media,
  p.created_at,
  a.author_name,
  a.author_link,
  p.like_count,
  p.dislike_count,
  p.comments_count,

  /* реакция текущего пользователя */
  CASE
    WHEN auth.uid() IS NULL THEN NULL
    ELSE (
      SELECT r.reaction_type
      FROM public.reactions r
      WHERE r.post_id = p.id
        AND r.user_id = auth.uid()
      LIMIT 1
    )
  END AS user_reaction,

  /* избранное */
  CASE
    WHEN auth.uid() IS NULL THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.favorites f
      WHERE f.post_id = p.id
        AND f.user_id = auth.uid()
    )
  END AS is_favorite

FROM public.telegram_posts p
JOIN public.authors a
  ON a.tg_author_id = p.tg_author_id

WHERE
  /* cursor pagination */
(
   cursor_created_at IS NULL
    OR (p.created_at, p.id) <
       (cursor_created_at, COALESCE(cursor_id, 9223372036854775807))
  )

  /* фильтр по автору */
  AND (author_id IS NULL OR p.tg_author_id = author_id)

  /* фильтр по токену */
  AND (
    token_name IS NULL
    OR EXISTS (
      SELECT 1
      FROM unnest(p.crypto_tokens) AS token
      WHERE lower(token) = lower(token_name)
    )
  )

  /* фильтр по mode */
  AND (
    CASE mode
      WHEN 'liked' THEN
        auth.uid() IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.reactions r
          WHERE r.post_id = p.id
            AND r.user_id = auth.uid()
            AND r.reaction_type = 'like'
        )

      WHEN 'disliked' THEN
        auth.uid() IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.reactions r
          WHERE r.post_id = p.id
            AND r.user_id = auth.uid()
            AND r.reaction_type = 'dislike'
        )

      WHEN 'favorites' THEN
        auth.uid() IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.favorites f
          WHERE f.post_id = p.id
            AND f.user_id = auth.uid()
        )

      WHEN 'all' THEN true
      ELSE false
    END
  )

ORDER BY
  p.created_at DESC,
  p.id DESC

LIMIT GREATEST(1, LEAST(page_limit, 100));
$$;
