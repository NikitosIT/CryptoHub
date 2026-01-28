alter table public.cryptotokens
add column priority int;

create index if not exists idx_cryptotokens_priority
on public.cryptotokens (priority);
