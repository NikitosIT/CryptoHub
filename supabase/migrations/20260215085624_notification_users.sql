create table if not exists public.notification_users (
    id bigserial primary key,
    send_to uuid not null references auth.users(id) on delete cascade,
    msg text,
    links jsonb default null,
    media jsonb default null,
    created_at timestamptz default now()
);

create index if not exists idx_notification_users_send_to on public.notification_users(send_to);
create index if not exists idx_notification_users_created_at on public.notification_users(created_at desc);

alter table public.notification_users enable row level security;


create policy "users can read own notifications"
on public.notification_users
for select
using (auth.uid() = send_to);
