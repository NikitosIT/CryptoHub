


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."fetch_telegram_post"("p_cursor_created_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_cursor_id" bigint DEFAULT NULL::bigint, "p_limit" integer DEFAULT 15, "p_author_id" bigint DEFAULT NULL::bigint, "p_token_name" "text" DEFAULT NULL::"text", "p_only_liked" boolean DEFAULT false, "p_only_disliked" boolean DEFAULT false, "p_only_favorites" boolean DEFAULT false, "p_user_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("id" bigint, "media_group_id" "text", "text_caption" "text", "text_entities" "jsonb", "crypto_tokens" "text"[], "tg_author_id" bigint, "media" "jsonb", "created_at" timestamp with time zone, "author_name" "text", "author_link" "text", "like_count" integer, "dislike_count" integer, "user_reaction" "text", "is_favorite" boolean)
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

  -- 🟢 текущая реакция пользователя (like/dislike)
  (
    select r.reaction_type
    from public.reactions r
    where r.post_id = p.id
      and r.user_id = p_user_id
    limit 1
  ) as user_reaction,

  -- 🟡 признак избранного
  exists (
    select 1
    from public.favorites f
    where f.post_id = p.id
      and f.user_id = p_user_id
  ) as is_favorite

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


ALTER FUNCTION "public"."fetch_telegram_post"("p_cursor_created_at" timestamp with time zone, "p_cursor_id" bigint, "p_limit" integer, "p_author_id" bigint, "p_token_name" "text", "p_only_liked" boolean, "p_only_disliked" boolean, "p_only_favorites" boolean, "p_user_id" "uuid") OWNER TO "postgres";





CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_reaction_update_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_reaction_update_timestamp"() OWNER TO "postgres";





CREATE OR REPLACE FUNCTION "public"."upsert_telegram_posts"("p_media_group_id" "text", "p_text_caption" "text", "p_text_entities" "jsonb", "p_crypto_tokens" "text"[], "p_tg_author_id" bigint, "p_media" "jsonb") RETURNS TABLE("post_id" bigint, "inserted" boolean)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF p_media_group_id IS NULL THEN
    RETURN QUERY
    INSERT INTO public.telegram_posts (
      text_caption,
      text_entities,
      crypto_tokens,
      tg_author_id,
      media
    )
    VALUES (
      p_text_caption,
      p_text_entities,
      COALESCE(p_crypto_tokens, ARRAY[]::TEXT[]),
      p_tg_author_id,
      p_media
    )
    RETURNING telegram_posts.id, (xmax = 0) AS inserted;

  ELSE
    RETURN QUERY
    INSERT INTO public.telegram_posts (
      media_group_id,
      text_caption,
      text_entities,
      crypto_tokens,
      tg_author_id,
      media
    )
    VALUES (
      p_media_group_id,
      p_text_caption,
      p_text_entities,
      COALESCE(p_crypto_tokens, ARRAY[]::TEXT[]),
      p_tg_author_id,
      p_media
    )
    ON CONFLICT (media_group_id)
    DO UPDATE SET
      -- объединяем токены
      crypto_tokens = (
        SELECT ARRAY(
          SELECT DISTINCT t
          FROM UNNEST(
            COALESCE(telegram_posts.crypto_tokens, ARRAY[]::TEXT[]) ||
            COALESCE(EXCLUDED.crypto_tokens, ARRAY[]::TEXT[])
          ) AS t
          ORDER BY t
        )
      ),
      -- объединяем медиа без дубликатов
      media = (
        SELECT JSONB_AGG(DISTINCT m)
        FROM JSONB_ARRAY_ELEMENTS(
          COALESCE(telegram_posts.media, '[]'::JSONB) || EXCLUDED.media
        ) AS m
      ),
      -- обновляем текст и entities
      text_caption = COALESCE(NULLIF(EXCLUDED.text_caption, ''), telegram_posts.text_caption),
      text_entities = COALESCE(
        NULLIF(EXCLUDED.text_entities, '[]'::JSONB),
        telegram_posts.text_entities
      )
    RETURNING telegram_posts.id, (xmax = 0) AS inserted;
  END IF;
END;
$$;


ALTER FUNCTION "public"."upsert_telegram_posts"("p_media_group_id" "text", "p_text_caption" "text", "p_text_entities" "jsonb", "p_crypto_tokens" "text"[], "p_tg_author_id" bigint, "p_media" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_favorites_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.telegram_posts
    SET favorites_count = COALESCE(favorites_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.telegram_posts
    SET favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_favorites_count"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."authors" (
    "id" bigint NOT NULL,
    "author_name" "text" NOT NULL,
    "author_link" "text",
    "tg_author_id" bigint NOT NULL
);


ALTER TABLE "public"."authors" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."authors_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."authors_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."authors_id_seq" OWNED BY "public"."authors"."id";



CREATE TABLE IF NOT EXISTS "public"."cryptotokens" (
    "id" bigint NOT NULL,
    "token_name" "text",
    "cmc_link" "text",
    "home_link" "text",
    "x_link" "text"
);


ALTER TABLE "public"."cryptotokens" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."cryptotokens_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."cryptotokens_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."cryptotokens_id_seq" OWNED BY "public"."cryptotokens"."id";



CREATE TABLE IF NOT EXISTS "public"."favorites" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "post_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."favorites" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."favorites_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."favorites_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."favorites_id_seq" OWNED BY "public"."favorites"."id";



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "nickname" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "last_changed" timestamp with time zone DEFAULT "now"(),
    "profile_logo" "text" DEFAULT 'C:\Users\nikit\tg-botik\frontend\public\tokens\BTC.svg'::"text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reactions" (
    "id" bigint NOT NULL,
    "user_id" "uuid",
    "post_id" bigint,
    "reaction_type" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "reactions_reaction_type_check" CHECK (("reaction_type" = ANY (ARRAY['like'::"text", 'dislike'::"text"])))
);


ALTER TABLE "public"."reactions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."reactions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."reactions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."reactions_id_seq" OWNED BY "public"."reactions"."id";



CREATE TABLE IF NOT EXISTS "public"."telegram_posts" (
    "id" bigint NOT NULL,
    "text_caption" "text",
    "text_entities" "jsonb",
    "crypto_tokens" "text"[],
    "tg_author_id" bigint,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "media_group_id" "text",
    "media" "jsonb",
    "like_count" integer DEFAULT 0 NOT NULL,
    "dislike_count" integer DEFAULT 0,
    "favorites_count" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "telegram_posts_text_entities_is_array" CHECK ((("text_entities" IS NULL) OR ("jsonb_typeof"("text_entities") = 'array'::"text")))
);


ALTER TABLE "public"."telegram_posts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."telegram_posts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."telegram_posts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."telegram_posts_id_seq" OWNED BY "public"."telegram_posts"."id";



CREATE TABLE IF NOT EXISTS "public"."token_forecasts" (
    "id" bigint NOT NULL,
    "token_name" "text" NOT NULL,
    "forecast_text" "text" NOT NULL,
    "sentiment" "text" DEFAULT 'neutral'::"text",
    "source_url" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "token_forecasts_sentiment_check" CHECK (("sentiment" = ANY (ARRAY['positive'::"text", 'neutral'::"text", 'negative'::"text"]))),
    CONSTRAINT "token_forecasts_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."token_forecasts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."token_forecasts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."token_forecasts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."token_forecasts_id_seq" OWNED BY "public"."token_forecasts"."id";



ALTER TABLE ONLY "public"."authors" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."authors_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."cryptotokens" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."cryptotokens_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."favorites" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."favorites_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."reactions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."reactions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."telegram_posts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."telegram_posts_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."token_forecasts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."token_forecasts_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."authors"
    ADD CONSTRAINT "authors_external_id_key" UNIQUE ("tg_author_id");



ALTER TABLE ONLY "public"."authors"
    ADD CONSTRAINT "authors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cryptotokens"
    ADD CONSTRAINT "cryptotokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_post_id_key" UNIQUE ("user_id", "post_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reactions"
    ADD CONSTRAINT "reactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reactions"
    ADD CONSTRAINT "reactions_user_id_post_id_key" UNIQUE ("user_id", "post_id");



ALTER TABLE ONLY "public"."telegram_posts"
    ADD CONSTRAINT "telegram_posts_media_group_id_key" UNIQUE ("media_group_id");



ALTER TABLE ONLY "public"."telegram_posts"
    ADD CONSTRAINT "telegram_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."token_forecasts"
    ADD CONSTRAINT "token_forecasts_pkey" PRIMARY KEY ("id");



CREATE INDEX "favorites_post_id_idx" ON "public"."favorites" USING "btree" ("post_id");



CREATE INDEX "favorites_user_id_idx" ON "public"."favorites" USING "btree" ("user_id");



CREATE INDEX "favorites_user_post_idx" ON "public"."favorites" USING "btree" ("user_id", "post_id");



CREATE INDEX "idx_posts_author_created_at_id" ON "public"."telegram_posts" USING "btree" ("tg_author_id", "created_at" DESC, "id" DESC);



CREATE INDEX "idx_posts_created_at" ON "public"."telegram_posts" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_posts_created_at_id_desc" ON "public"."telegram_posts" USING "btree" ("created_at" DESC, "id" DESC);



CREATE INDEX "idx_posts_tokens_gin" ON "public"."telegram_posts" USING "gin" ("crypto_tokens");



CREATE INDEX "reactions_post_idx" ON "public"."reactions" USING "btree" ("post_id");



CREATE INDEX "reactions_type_idx" ON "public"."reactions" USING "btree" ("reaction_type");



CREATE INDEX "reactions_user_idx" ON "public"."reactions" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "trigger_update_favorites_count" AFTER INSERT OR DELETE ON "public"."favorites" FOR EACH ROW EXECUTE FUNCTION "public"."update_favorites_count"();



CREATE OR REPLACE TRIGGER "trigger_update_reaction_timestamp" BEFORE UPDATE ON "public"."reactions" FOR EACH ROW EXECUTE FUNCTION "public"."handle_reaction_update_timestamp"();



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."telegram_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reactions"
    ADD CONSTRAINT "reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."telegram_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reactions"
    ADD CONSTRAINT "reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow all to read authors" ON "public"."authors" FOR SELECT USING (true);



CREATE POLICY "Allow all to read cryptotokens" ON "public"."cryptotokens" FOR SELECT USING (true);



CREATE POLICY "Allow all to read posts" ON "public"."telegram_posts" FOR SELECT USING (true);



CREATE POLICY "Allow anon select" ON "public"."telegram_posts" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Allow anon update status in admin" ON "public"."token_forecasts" FOR UPDATE TO "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Allow read access to cryptotokens" ON "public"."cryptotokens" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow read access to token_forecasts" ON "public"."token_forecasts" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow read for all" ON "public"."reactions" FOR SELECT USING (true);



CREATE POLICY "Allow service writes" ON "public"."reactions" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Anyone can read profiles" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Public can read approved forecasts" ON "public"."token_forecasts" FOR SELECT USING (("status" = 'approved'::"text"));



CREATE POLICY "Service role can manage forecasts" ON "public"."token_forecasts" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Users can delete their own favorites" ON "public"."favorites" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own favorites" ON "public"."favorites" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own favorites" ON "public"."favorites" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."authors" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "authors: public read" ON "public"."authors" FOR SELECT USING (true);



ALTER TABLE "public"."cryptotokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."favorites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."telegram_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."token_forecasts" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";












GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";





GRANT ALL ON FUNCTION "public"."fetch_telegram_post"("p_cursor_created_at" timestamp with time zone, "p_cursor_id" bigint, "p_limit" integer, "p_author_id" bigint, "p_token_name" "text", "p_only_liked" boolean, "p_only_disliked" boolean, "p_only_favorites" boolean, "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_telegram_post"("p_cursor_created_at" timestamp with time zone, "p_cursor_id" bigint, "p_limit" integer, "p_author_id" bigint, "p_token_name" "text", "p_only_liked" boolean, "p_only_disliked" boolean, "p_only_favorites" boolean, "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_telegram_post"("p_cursor_created_at" timestamp with time zone, "p_cursor_id" bigint, "p_limit" integer, "p_author_id" bigint, "p_token_name" "text", "p_only_liked" boolean, "p_only_disliked" boolean, "p_only_favorites" boolean, "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_reaction_update_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_reaction_update_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_reaction_update_timestamp"() TO "service_role";






GRANT ALL ON FUNCTION "public"."update_favorites_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_favorites_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_favorites_count"() TO "service_role";






GRANT ALL ON FUNCTION "public"."upsert_telegram_posts"("p_media_group_id" "text", "p_text_caption" "text", "p_text_entities" "jsonb", "p_crypto_tokens" "text"[], "p_tg_author_id" bigint, "p_media" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_telegram_posts"("p_media_group_id" "text", "p_text_caption" "text", "p_text_entities" "jsonb", "p_crypto_tokens" "text"[], "p_tg_author_id" bigint, "p_media" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_telegram_posts"("p_media_group_id" "text", "p_text_caption" "text", "p_text_entities" "jsonb", "p_crypto_tokens" "text"[], "p_tg_author_id" bigint, "p_media" "jsonb") TO "service_role";






GRANT ALL ON TABLE "public"."authors" TO "anon";
GRANT ALL ON TABLE "public"."authors" TO "authenticated";
GRANT ALL ON TABLE "public"."authors" TO "service_role";



GRANT ALL ON SEQUENCE "public"."authors_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."authors_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."authors_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cryptotokens" TO "anon";
GRANT ALL ON TABLE "public"."cryptotokens" TO "authenticated";
GRANT ALL ON TABLE "public"."cryptotokens" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cryptotokens_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cryptotokens_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cryptotokens_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."favorites" TO "anon";
GRANT ALL ON TABLE "public"."favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."favorites" TO "service_role";



GRANT ALL ON SEQUENCE "public"."favorites_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."favorites_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."favorites_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."reactions" TO "anon";
GRANT ALL ON TABLE "public"."reactions" TO "authenticated";
GRANT ALL ON TABLE "public"."reactions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."reactions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."reactions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."reactions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."telegram_posts" TO "anon";
GRANT ALL ON TABLE "public"."telegram_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."telegram_posts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."telegram_posts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."telegram_posts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."telegram_posts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."token_forecasts" TO "anon";
GRANT ALL ON TABLE "public"."token_forecasts" TO "authenticated";
GRANT ALL ON TABLE "public"."token_forecasts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."token_forecasts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."token_forecasts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."token_forecasts_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







drop policy "Allow read access to cryptotokens" on "public"."cryptotokens";

drop policy "Allow read access to token_forecasts" on "public"."token_forecasts";


  create policy "Allow read access to cryptotokens"
  on "public"."cryptotokens"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Allow read access to token_forecasts"
  on "public"."token_forecasts"
  as permissive
  for select
  to anon, authenticated
using (true);


CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Allow deletes for owners"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'user_avatars'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Allow public access to avatars"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'user_avatars'::text));



  create policy "Allow updates for authenticated users"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'user_avatars'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Allow uploads for authenticated users"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'user_avatars'::text) AND (auth.role() = 'authenticated'::text)));




