# Database Setup

This project is prepared for Supabase:

1. Create a Supabase project.
2. Run `docs/database/supabase-schema.sql` in the Supabase SQL Editor.
3. Create a public Storage bucket named `tunacosplay-media`.
4. Copy `.env.example` to `.env.local` and fill:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET`

The current API keeps a `.data/` fallback for local development. Once Supabase env vars are set, `/api/admin/drafts` uses Supabase automatically.
