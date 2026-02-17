create table if not exists public.notification_to_admin (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    admin_msg text not null,
    msg text not null,
    created_at timestamptz default now() not null
);

create index if not exists idx_notification_to_admin_user_id 
    on public.notification_to_admin(user_id);

create index if not exists idx_notification_to_admin_created_at 
    on public.notification_to_admin(created_at desc);

alter table public.notification_to_admin enable row level security;

create policy "users can insert own replies"
on public.notification_to_admin
for insert
with check (auth.uid() = user_id);

create policy "users can read own replies"
on public.notification_to_admin
for select
using (auth.uid() = user_id);

create policy "admins can read all replies"
on public.notification_to_admin
for select
using (
    exists (
        select 1 from public.admin_users
        where admin_users.id = auth.uid()
    )
);
