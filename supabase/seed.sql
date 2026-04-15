INSERT INTO storage.buckets (id, name, public)
VALUES
  ('tg_media', 'tg_media', true),
  ('user_avatars', 'user_avatars', true),
  ('comment_media', 'comment_media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.authors (author_name, author_link, tg_author_id)
VALUES
  ('КРИПТО ИЛЬЯ', 'https://t.me/crypto_ilya', -1001579090675),
  ('COIN 22', 'https://t.me/COIN22T', -1001792822445)
ON CONFLICT DO NOTHING;

INSERT INTO public.admin_users (id, email)
SELECT id, email
FROM auth.users
ON CONFLICT (id) DO NOTHING;