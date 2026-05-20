-- Rename the old SoraFolder download provider to Terabox.

delete from public.download_links old_links
where old_links.provider = 'sorafolder'
  and exists (
    select 1
    from public.download_links new_links
    where new_links.post_id = old_links.post_id
      and new_links.provider = 'terabox'
  );

update public.download_links
set provider = 'terabox'
where provider = 'sorafolder';

do $$
declare
  constraint_name text;
begin
  alter table public.download_links
  drop constraint if exists download_links_provider_check;

  select conname
  into constraint_name
  from pg_constraint
  where conrelid = 'public.download_links'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%provider%'
    and pg_get_constraintdef(oid) like '%sorafolder%'
  limit 1;

  if constraint_name is not null then
    execute format(
      'alter table public.download_links drop constraint %I',
      constraint_name
    );
  end if;
end
$$;

alter table public.download_links
add constraint download_links_provider_check
check (provider in ('mediafire', 'telegram', 'terabox', 'gofile'));
