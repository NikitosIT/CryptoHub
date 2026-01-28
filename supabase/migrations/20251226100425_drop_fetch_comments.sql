DROP FUNCTION IF EXISTS fetch_comments(
  p_cursor_created_at timestamp,
  p_cursor_id bigint,
  p_limit integer,
  p_user_id uuid
);
