-- First-party monitoring tables for visits and content demand.
-- Raw IP addresses are not stored; the application writes a daily visitor hash.

create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  visit_date date not null default current_date,
  visitor_hash text not null,
  first_path text not null default '/',
  last_path text not null default '/',
  referrer text,
  user_agent text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (visit_date, visitor_hash)
);

create table if not exists public.content_events (
  id uuid primary key default gen_random_uuid(),
  event_date date not null default current_date,
  visitor_hash text not null,
  post_id uuid not null references public.posts(id) on delete cascade,
  event_type text not null check (event_type in ('view', 'download')),
  provider text not null default '' check (
    provider in ('', 'mediafire', 'telegram', 'terabox', 'gofile')
  ),
  path text not null default '/',
  created_at timestamptz not null default now(),
  unique (event_date, visitor_hash, post_id, event_type, provider)
);

create index if not exists site_visits_visit_date_idx
  on public.site_visits (visit_date desc);

create index if not exists content_events_event_date_idx
  on public.content_events (event_date desc);

create index if not exists content_events_post_event_idx
  on public.content_events (post_id, event_type, event_date desc);

alter table public.site_visits enable row level security;
alter table public.content_events enable row level security;
