-- Tunacosplay Supabase schema
-- Run this in Supabase SQL Editor before enabling the Next.js API integration.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'post_status') then
    create type post_status as enum ('draft', 'published', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'preview_media_type') then
    create type preview_media_type as enum ('image', 'video');
  end if;
end
$$;

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  cosplayer text not null,
  character text not null,
  source text not null,
  category text not null,
  tags text[] not null default '{}',
  photo_count integer not null default 0,
  video_count integer not null default 0,
  thumbnail_url text,
  hero_image_url text,
  file_size text,
  unzip_password text default 'cosplaytele',
  description text,
  status post_status not null default 'draft',
  views_24h integer not null default 0,
  views_3d integer not null default 0,
  views_7d integer not null default 0,
  total_views integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists preview_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  media_type preview_media_type not null,
  url text,
  poster_url text,
  alt_text text,
  width integer,
  height integer,
  duration text,
  sort_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists download_links (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  provider text not null check (provider in ('mediafire', 'telegram', 'sorafolder', 'gofile')),
  url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, provider)
);

create index if not exists posts_status_created_at_idx on posts (status, created_at desc);
create index if not exists posts_category_status_idx on posts (category, status);
create index if not exists preview_media_post_order_idx on preview_media (post_id, sort_order);
create index if not exists download_links_post_id_idx on download_links (post_id);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_posts_updated_at on posts;
create trigger set_posts_updated_at
before update on posts
for each row execute function set_updated_at();

drop trigger if exists set_preview_media_updated_at on preview_media;
create trigger set_preview_media_updated_at
before update on preview_media
for each row execute function set_updated_at();

drop trigger if exists set_download_links_updated_at on download_links;
create trigger set_download_links_updated_at
before update on download_links
for each row execute function set_updated_at();

alter table posts enable row level security;
alter table preview_media enable row level security;
alter table download_links enable row level security;

drop policy if exists "Public can read published posts" on posts;
create policy "Public can read published posts"
on posts for select
using (status = 'published');

drop policy if exists "Public can read published preview media" on preview_media;
create policy "Public can read published preview media"
on preview_media for select
using (
  exists (
    select 1 from posts
    where posts.id = preview_media.post_id
    and posts.status = 'published'
  )
);

drop policy if exists "Public can read published download links" on download_links;
create policy "Public can read published download links"
on download_links for select
using (
  exists (
    select 1 from posts
    where posts.id = download_links.post_id
    and posts.status = 'published'
  )
);
