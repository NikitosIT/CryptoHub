DROP FUNCTION IF EXISTS public.fetch_telegram_post(
  timestamp with time zone,
  bigint,
  integer,
  bigint,
  text,
  boolean,
  boolean,
  boolean,
  uuid
);

CREATE OR REPLACE FUNCTION "public"."fetch_telegram_post"(
  "p_cursor_created_at" timestamp with time zone DEFAULT NULL::timestamp with time zone,
  "p_cursor_id" bigint DEFAULT NULL::bigint,
  "p_limit" integer DEFAULT 15,
  "p_author_id" bigint DEFAULT NULL::bigint,
  "p_token_name" "text" DEFAULT NULL::"text",
  "p_only_liked" boolean DEFAULT false,
  "p_only_disliked" boolean DEFAULT false,
  "p_only_favorites" boolean DEFAULT false,
  "p_user_id" "uuid" DEFAULT NULL::"uuid"
) RETURNS TABLE(
  "id" bigint,
  "media_group_id" "text",
  "text_caption" "text",
  "text_entities" "jsonb",
  "crypto_tokens" "text"[],
  "tg_author_id" bigint,
  "media" "jsonb",
  "created_at" timestamp with time zone,
  "author_name" "text",
  "author_link" "text",
  "like_count" integer,
  "dislike_count" integer,
  "comments_count" integer,
  "user_reaction" "text",
  "is_favorite" boolean
)
LANGUAGE "sql"
SET "search_path" TO 'public'
AS $$
select distinct
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

  --  current user reaction
 case 
    when p_user_id is not null then (
      select r.reaction_type
      from public.reactions r
      where r.post_id = p.id
        and r.user_id = p_user_id
      limit 1
    )
    else null
  end as user_reaction,

  --  favorite flag
 case 
    when p_user_id is not null then exists (
      select 1
      from public.favorites f
      where f.post_id = p.id
        and f.user_id = p_user_id
    )
    else false
  end as is_favorite

from public.telegram_posts p
join public.authors a on a.tg_author_id = p.tg_author_id
left join public.cryptotokens ct on ct.token_name = any(p.crypto_tokens)
where
  (p_cursor_created_at is null or (p.created_at, p.id) < (p_cursor_created_at, coalesce(p_cursor_id, 9223372036854775807)))

  -- 🔹 фильтры по лайкам, дизлайкам и избранным
  and (
    (not p_only_liked and not p_only_disliked and not p_only_favorites)
    or (
      p_user_id is not null and (
        (p_only_liked and exists (
          select 1 from public.reactions r
          where r.post_id = p.id
            and r.user_id = p_user_id
            and r.reaction_type = 'like'
        ))
        or (p_only_disliked and exists (
          select 1 from public.reactions r
          where r.post_id = p.id
            and r.user_id = p_user_id
            and r.reaction_type = 'dislike'
        ))
        or (p_only_favorites and exists (
          select 1 from public.favorites f
          where f.post_id = p.id
            and f.user_id = p_user_id
        ))
      )
    )
  )

  -- 🔹 фильтры по авторам и токенам
  and (p_author_id is null or p.tg_author_id = p_author_id)
  and (p_token_name is null or lower(ct.token_name) = lower(p_token_name))

order by p.created_at desc, p.id desc
limit greatest(1, least(p_limit, 100));
$$;




