DROP TABLE IF EXISTS admin_users;

create table if not exists public.admin_users (
    id uuid primary key
    references auth.users(id)
    on delete cascade,
    email text not null unique,
    created_at timestamptz default now() not null
);

create index if not exists idx_admin_users_email 
    on public.admin_users(email);

alter table public.admin_users enable row level security;
-- RLS Policy: Deny all public access

create policy "Deny all public access to admin_users"
    on public.admin_users
    for all
    using (false)
    with check (false);
