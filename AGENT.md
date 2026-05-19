# Database Deployment Agent Guide

Panduan ini untuk AI agent atau engineer lain yang membantu deploy database dan Supabase self-hosted untuk project `cosplaytele-cloning`.

## Goal

Deploy stack production-ish di satu VPS:

- Next.js app `cosplaytele-cloning`
- Supabase self-hosted via Docker
- PostgreSQL dari stack Supabase
- Storage bucket untuk thumbnail, hero image, preview foto, dan preview video
- Reverse proxy HTTPS di depan service public

Target arsitektur:

```txt
Internet
  -> 80/443 only
  -> Caddy/Nginx/Traefik reverse proxy
  -> Next.js app internal Docker network
  -> Supabase Kong/API internal Docker network
  -> PostgreSQL internal only
```

## Important Security Notes

Do not expose database ports publicly.

Avoid public bindings like:

```yaml
ports:
  - "5432:5432"
  - "3000:3000"
  - "8000:8000"
```

Prefer localhost-only bindings when a service must be reachable by the host reverse proxy:

```yaml
ports:
  - "127.0.0.1:3000:3000"
```

For Docker services that only need internal communication, avoid `ports:` entirely. Use Docker network service names instead.

## UFW Guidance

Use UFW as a baseline firewall, but do not rely on UFW alone to protect Docker containers. Docker can create its own firewall rules for published ports, and Docker-published ports can bypass normal UFW expectations.

Recommended baseline:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

If SSH runs on a custom port, allow that instead of `OpenSSH`.

Only allow direct Postgres access if absolutely required, and restrict it by source IP:

```bash
sudo ufw allow from YOUR_STATIC_IP to any port 5432 proto tcp
```

Even then, prefer VPN/private networking or SSH tunnel over public DB exposure.

## Public Ports

Allowed public ports:

- `22/tcp` or custom SSH port, ideally restricted to trusted IPs
- `80/tcp`
- `443/tcp`

Do not expose publicly:

- Postgres `5432`
- Supavisor/pooler `6543`, unless explicitly needed and IP-restricted
- Supabase internal services
- Next.js `3000`
- Supabase Kong `8000`, if using reverse proxy on `443`

## Supabase Setup

Use Supabase self-hosting with Docker.

Minimum production requirements:

1. Generate strong secrets.
2. Change default dashboard credentials.
3. Configure Supabase public URLs behind HTTPS.
4. Put Kong/API behind reverse proxy.
5. Keep Postgres internal.
6. Create the storage bucket `tunacosplay-media`.

Relevant project files:

- `.env.example`
- `docs/database/README.md`
- `docs/database/supabase-schema.sql`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/drafts.ts`
- `src/app/api/admin/drafts/route.ts`

## Environment Variables

Create `.env.local` or production env vars for the Next.js app:

```bash
SUPABASE_URL=https://supabase.example.com
SUPABASE_SERVICE_ROLE_KEY=replace-with-secret-server-key
SUPABASE_STORAGE_BUCKET=tunacosplay-media
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` to client-side code or public logs.

## Database Schema

Run this SQL in Supabase SQL Editor:

```txt
docs/database/supabase-schema.sql
```

It creates:

- `posts`
- `preview_media`
- `download_links`
- enums for post status and media type
- indexes
- updated-at triggers
- basic public read policies for published content

Draft writes currently use the service role key from the server-side API route.

## Current App Behavior

The app already supports two draft storage modes:

1. If Supabase env vars are configured, `/api/admin/drafts` uses Supabase.
2. If Supabase env vars are missing, it falls back to `.data/admin-post-drafts.json`.

To verify which mode is active:

```bash
curl http://localhost:3000/api/admin/drafts
```

Expected response includes:

```json
{
  "source": "supabase"
}
```

or fallback:

```json
{
  "source": "local"
}
```

## Storage Plan

Bucket name:

```txt
tunacosplay-media
```

Suggested paths:

```txt
thumbnails/{slug}.jpg
heroes/{slug}.jpg
previews/{slug}/{sortOrder}.jpg
previews/{slug}/{sortOrder}.mp4
```

For small preview images, standard Supabase Storage upload is fine. For larger preview videos, prefer resumable uploads/TUS or another CDN-backed flow.

Full gallery archives should not be hosted in this app by default. Store external download links in `download_links`.

## Deployment Checklist

1. Install Docker Engine and Docker Compose on the VPS.
2. Deploy Supabase self-hosted stack.
3. Set strong Supabase `.env` secrets.
4. Put Supabase behind HTTPS reverse proxy.
5. Create `tunacosplay-media` bucket.
6. Run `docs/database/supabase-schema.sql`.
7. Deploy the Next.js app.
8. Set app env vars for Supabase.
9. Ensure app and Supabase can communicate through internal network or HTTPS URL.
10. Verify `/api/admin/drafts` returns `source: "supabase"`.
11. Verify `/admin/posts/new` can save a draft.
12. Verify `/admin` shows that draft.
13. Confirm no database/internal ports are public.

## Verification Commands

On VPS:

```bash
sudo ufw status verbose
docker compose ps
ss -tulpn
```

Check exposed ports from outside the server:

```bash
nmap -Pn YOUR_SERVER_IP
```

Only expected public ports should show: SSH, HTTP, HTTPS.

For the app:

```bash
npm run check
curl https://your-app-domain.com/api/admin/drafts
```

## References

- Docker firewall behavior: https://docs.docker.com/engine/network/packet-filtering-firewalls/
- Docker port publishing: https://docs.docker.com/reference/cli/docker/container/run/
- Supabase self-hosted Docker: https://supabase.com/docs/guides/self-hosting/docker
- Supabase reverse proxy HTTPS: https://supabase.com/docs/guides/self-hosting/self-hosted-proxy-https
- Supabase Storage upload: https://supabase.com/docs/reference/javascript/storage-from-upload
- Supabase resumable uploads: https://supabase.com/docs/guides/storage/uploads/resumable-uploads/
