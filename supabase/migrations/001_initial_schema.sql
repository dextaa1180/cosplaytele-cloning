-- Tunacosplay application schema.
-- This migration creates the database logic only. It does not seed content.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'post_status'
  ) then
    create type public.post_status as enum ('draft', 'published', 'archived');
  end if;

  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'preview_media_type'
  ) then
    create type public.preview_media_type as enum ('image', 'video');
  end if;
end
$$;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  cosplayer text not null,
  character text not null,
  source text not null,
  category text not null,
  tags text[] not null default '{}',
  photo_count integer not null default 0 check (photo_count >= 0),
  video_count integer not null default 0 check (video_count >= 0),
  thumbnail_url text,
  hero_image_url text,
  file_size text,
  unzip_password text not null default 'cosplaytele',
  description text,
  status public.post_status not null default 'draft',
  views_24h integer not null default 0 check (views_24h >= 0),
  views_3d integer not null default 0 check (views_3d >= 0),
  views_7d integer not null default 0 check (views_7d >= 0),
  total_views integer not null default 0 check (total_views >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.preview_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  media_type public.preview_media_type not null,
  url text,
  poster_url text,
  alt_text text,
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  duration text,
  sort_order integer not null default 1 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.download_links (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  provider text not null check (
    provider in ('mediafire', 'telegram', 'terabox', 'gofile')
  ),
  url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, provider)
);

create index if not exists posts_status_created_at_idx
  on public.posts (status, created_at desc);

create index if not exists posts_status_total_views_idx
  on public.posts (status, total_views desc);

create index if not exists posts_category_status_idx
  on public.posts (category, status);

create index if not exists posts_source_status_idx
  on public.posts (source, status);

create index if not exists posts_cosplayer_status_idx
  on public.posts (cosplayer, status);

create index if not exists posts_tags_gin_idx
  on public.posts using gin (tags);

create index if not exists preview_media_post_order_idx
  on public.preview_media (post_id, sort_order);

create index if not exists download_links_post_id_idx
  on public.download_links (post_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

drop trigger if exists set_preview_media_updated_at on public.preview_media;
create trigger set_preview_media_updated_at
before update on public.preview_media
for each row execute function public.set_updated_at();

drop trigger if exists set_download_links_updated_at on public.download_links;
create trigger set_download_links_updated_at
before update on public.download_links
for each row execute function public.set_updated_at();

alter table public.posts enable row level security;
alter table public.preview_media enable row level security;
alter table public.download_links enable row level security;

drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts"
on public.posts for select
using (status = 'published');

drop policy if exists "Public can read published preview media" on public.preview_media;
create policy "Public can read published preview media"
on public.preview_media for select
using (
  exists (
    select 1
    from public.posts
    where posts.id = preview_media.post_id
      and posts.status = 'published'
  )
);

drop policy if exists "Public can read published download links" on public.download_links;
create policy "Public can read published download links"
on public.download_links for select
using (
  exists (
    select 1
    from public.posts
    where posts.id = download_links.post_id
      and posts.status = 'published'
  )
);

do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('tunacosplay-media', 'tunacosplay-media', true, null, null)
    on conflict (id) do update
    set public = excluded.public,
        file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;
  end if;
end
$$;

do $$
begin
  if to_regclass('storage.objects') is not null then
    alter table storage.objects enable row level security;

    drop policy if exists "Public can read tunacosplay media" on storage.objects;
    create policy "Public can read tunacosplay media"
    on storage.objects for select
    using (bucket_id = 'tunacosplay-media');
  end if;
end
$$;
