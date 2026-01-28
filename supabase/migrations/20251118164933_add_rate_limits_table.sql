-- Create rate_limits table for tracking API rate limits
create table if not exists public.rate_limits (
    id bigserial primary key,
    user_id uuid references auth.users(id) on delete cascade,
    action text not null,
    created_at timestamptz default now() not null
);

-- Indexes for efficient rate limit queries
create index if not exists idx_rate_limits_user_action_created 
    on public.rate_limits(user_id, action, created_at desc);

create index if not exists idx_rate_limits_created_at 
    on public.rate_limits(created_at);

-- Enable RLS (though this table is primarily accessed by service role)
alter table public.rate_limits enable row level security;

-- Policy: Users can only see their own rate limit entries (for transparency/debugging)
create policy "users can view their own rate limits"
    on public.rate_limits
    for select
    using (auth.uid() = user_id);

-- Policy: Service role can insert/delete (for edge functions)
-- Note: Edge functions use service role, so they can bypass RLS
-- This policy is mainly for security if someone tries to access via client

