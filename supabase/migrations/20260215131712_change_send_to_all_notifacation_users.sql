alter table public.notification_users
alter column send_to drop not null;


alter table public.notification_users
add constraint notification_users_send_to_or_broadcast
check (send_to_all = true or send_to is not null);


drop policy if exists "users can read own notifications" on public.notification_users;
create policy "users can read own notifications"
on public.notification_users
for select
using (auth.uid() = send_to or send_to_all = true);
