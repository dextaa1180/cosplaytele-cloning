# Database Setup

This folder stores the schema-only SQL for rebuilding the Tunacosplay database
logic on a fresh Supabase/Postgres instance. It creates tables, indexes,
triggers, RLS read policies, and the public `tunacosplay-media` storage bucket.
It does not insert post content.

The canonical migrations are:

```text
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_replace_sorafolder_with_terabox.sql
supabase/migrations/003_monitoring_analytics.sql
supabase/migrations/006_telegram_post_messages.sql
```

`docs/database/supabase-schema.sql` mirrors that migration for manual SQL
Editor usage.

## Apply On A New VPS

After Supabase self-hosted is running, apply the schema from the project root:

```bash
cat supabase/migrations/001_initial_schema.sql | docker exec -i supabase-db psql -U postgres postgres
cat supabase/migrations/002_replace_sorafolder_with_terabox.sql | docker exec -i supabase-db psql -U postgres postgres
cat supabase/migrations/003_monitoring_analytics.sql | docker exec -i supabase-db psql -U postgres postgres
cat supabase/migrations/006_telegram_post_messages.sql | docker exec -i supabase-db psql -U postgres postgres
```

Or paste `docs/database/supabase-schema.sql` into the Supabase SQL Editor.

## What This Restores

The schema creates the app database logic for:

- `posts`
- `preview_media`
- `download_links`
- `telegram_post_messages`
- post status and media type enums
- indexes for category, source, cosplayer, tags, and ranking pages
- `updated_at` triggers
- public read policies for published content
- public storage bucket `tunacosplay-media`
- first-party monitoring tables for unique visits and download clicks
- Telegram channel message id mapping for edit/delete sync

After applying this migration, the admin dashboard can create new content again.
Old post data is not restored unless you also restore a full database dump.

## Backup Types

Schema only, for table/logic backup:

```bash
docker exec -t supabase-db pg_dump -U postgres postgres --schema-only > supabase-schema-$(date +%F).sql
```

Full database, for table/logic plus existing post content:

```bash
docker exec -t supabase-db pg_dump -U postgres postgres | gzip > supabase-backup-$(date +%F).sql.gz
```

## Environment

Set these in the VPS `.env` file used by the app:

```text
SUPABASE_URL=http://kong:8000
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=tunacosplay-media
PUBLIC_STORAGE_BASE_URL=https://tunacosplay.site
ANALYTICS_SALT=optional-long-random-string
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHANNEL_ID=@channel_or_-100_id
TELEGRAM_POST_LABEL=ASUPAN
TELEGRAM_SHOP_URL=https://tunakaslana.shop/
PUBLIC_SITE_URL=https://tunacosplay.site
```

The app keeps a `.data/` fallback for local development. Once Supabase env vars
are set, admin drafts and published posts use Supabase automatically.
`ANALYTICS_SALT` is optional, but recommended so visitor hashes cannot be
recomputed from raw request data.
