create table if not exists public.comments (
    id bigserial primary key,
    user_id uuid references auth.users(id) on delete cascade,
    post_id bigint references public.telegram_posts(id) on delete cascade,
    parent_comment_id bigint references public.comments(id) on delete cascade,
    text text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_comments_user_id on public.comments(user_id);
create index if not exists idx_comments_created_at on public.comments(created_at desc);
create index if not exists idx_comments_parent_id on public.comments(parent_comment_id);

alter table public.comments enable row level security;

drop policy if exists "users can insert their own comments" on public.comments;
create policy "users can insert their own comments"
on public.comments
for insert
with check (auth.uid() = user_id);

drop policy if exists "everyone can read comments" on public.comments;
create policy "everyone can read comments"
on public.comments
for select
using (true);

drop policy if exists "users can update their own comments" on public.comments;
create policy "users can update their own comments"
on public.comments
for update
using (auth.uid() = user_id);

drop policy if exists "users can delete their own comments" on public.comments;
create policy "users can delete their own comments"
on public.comments
for delete
using (auth.uid() = user_id);
