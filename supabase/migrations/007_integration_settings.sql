-- Stores non-secret dashboard integration settings.
-- Secrets such as bot tokens stay in server environment variables.

create table if not exists public.integration_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_integration_settings_updated_at on public.integration_settings;
create trigger set_integration_settings_updated_at
before update on public.integration_settings
for each row execute function public.set_updated_at();

alter table public.integration_settings enable row level security;
