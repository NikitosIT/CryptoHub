alter table public.notification_users
add column if not exists send_to_all boolean not null default false;

create index if not exists idx_notification_users_send_to_all
on public.notification_users(send_to_all);
