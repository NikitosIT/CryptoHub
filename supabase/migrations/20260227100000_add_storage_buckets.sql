INSERT INTO storage.buckets (id, name, public)
VALUES
  ('tg_media', 'tg_media', true),
  ('user_avatars', 'user_avatars', true),
  ('comment_media', 'comment_media', true)
ON CONFLICT (id) DO NOTHING;
