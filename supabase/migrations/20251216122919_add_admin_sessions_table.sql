-- Create admin_sessions table for storing admin authentication sessions
create table if not exists public.admin_sessions (
    id bigserial primary key,
    token text not null unique,
    expires_at timestamptz not null,
    created_at timestamptz default now() not null
);

-- Index for efficient token lookups
create index if not exists idx_admin_sessions_token 
    on public.admin_sessions(token);

-- Index for efficient cleanup of expired sessions
create index if not exists idx_admin_sessions_expires_at 
    on public.admin_sessions(expires_at);

-- Enable RLS (though this table is primarily accessed by service role)
alter table public.admin_sessions enable row level security;

-- Policy: No public access (only service role via edge functions)
-- Edge functions use service role, so they can bypass RLS
-- This policy ensures no client-side access

