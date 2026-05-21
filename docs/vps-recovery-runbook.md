# VPS Recovery Runbook

This note records the outage that happened on May 21, 2026 and the recovery
steps for Tunacosplay.

## What Happened

The public website failed even though the app image itself was valid.

The actual chain was:

1. `nginx` was inactive, so the domain could not reach the app.
2. The Next.js app container was recreated and became healthy.
3. The app still rendered an error because it could not fetch Supabase.
4. Supabase/Kong was not running, so `SUPABASE_URL=http://kong:8000` failed.
5. Starting `/opt/supabase-project` brought back `supabase-db`,
   `supabase-analytics`, and `supabase-kong`.
6. After Kong became healthy, `fetch("http://kong:8000")` returned `401`,
   which is normal for the Kong root path and confirms network connectivity.
7. Recreating the app with `SUPABASE_URL=http://kong:8000` restored the site.

This was not caused by the pagination refactor. Pagination only changed the
Next.js public card grid. It cannot stop nginx or Supabase containers.

## Correct VPS Environment

The app container should use:

```env
SUPABASE_URL=http://kong:8000
SUPABASE_STORAGE_BUCKET=tunacosplay-media
PUBLIC_STORAGE_BASE_URL=https://tunacosplay.site
HOST_BIND=127.0.0.1
PORT=3000
DEV_PORT=3001
```

Do not switch to `host.docker.internal` for this VPS setup while the app is
attached to the Supabase Docker network and `kong` resolves correctly.

## Quick Diagnosis

Run these from the app project:

```bash
cd /root/Project/cosplaytele-cloning
docker ps
curl -I http://127.0.0.1:3000
curl -I https://tunacosplay.site
docker logs --tail=80 cosplaytele-cloning
```

Check nginx:

```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -n 80 /var/log/nginx/error.log
```

Check Supabase/Kong:

```bash
cd /opt/supabase-project
docker compose ps
curl -I http://127.0.0.1:8000
```

Check app-to-Supabase network:

```bash
cd /root/Project/cosplaytele-cloning
docker exec -it cosplaytele-cloning sh -lc 'env | grep SUPABASE_URL'
docker exec -it cosplaytele-cloning sh -lc 'node -e "fetch(process.env.SUPABASE_URL).then(r=>console.log(r.status)).catch(e=>console.error(e.message))"'
```

Expected result for the second command is usually `401`. That is good. It means
the app can reach Kong.

## Recovery Steps

1. Start nginx:

```bash
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx
```

2. Start Supabase:

```bash
cd /opt/supabase-project
docker compose up -d
docker compose up -d kong
docker compose ps
curl -I http://127.0.0.1:8000
```

3. Recreate the app:

```bash
cd /root/Project/cosplaytele-cloning
docker compose up -d --force-recreate app
docker exec -it cosplaytele-cloning sh -lc 'node -e "fetch(process.env.SUPABASE_URL).then(r=>console.log(r.status)).catch(e=>console.error(e.message))"'
curl -I https://tunacosplay.site
```

## Auto-Restart Nginx

Enable nginx at boot:

```bash
sudo systemctl enable --now nginx
```

Add a systemd override so nginx restarts if it exits unexpectedly:

```bash
sudo systemctl edit nginx
```

Paste:

```ini
[Service]
Restart=always
RestartSec=5s
```

Apply:

```bash
sudo systemctl daemon-reload
sudo systemctl restart nginx
sudo systemctl status nginx
```

`Restart=always` will not fight a deliberate `systemctl stop nginx`, but it
will recover from unexpected process exits.

## Auto-Start Docker Containers

Confirm the app has a restart policy:

```bash
cd /root/Project/cosplaytele-cloning
docker inspect cosplaytele-cloning --format '{{.HostConfig.RestartPolicy.Name}}'
```

It should be:

```text
unless-stopped
```

Confirm Supabase services also have restart policies:

```bash
cd /opt/supabase-project
docker compose config | grep -n "restart:"
```

If a service is missing a restart policy, set it in the Supabase compose file
outside the app repository.

## Commands To Avoid

Do not run these unless intentionally wiping data:

```bash
docker compose down -v
docker volume rm ...
rm -rf /opt/supabase-project/volumes/db/data
```

The PostgreSQL data lives under:

```text
/opt/supabase-project/volumes/db/data
```
