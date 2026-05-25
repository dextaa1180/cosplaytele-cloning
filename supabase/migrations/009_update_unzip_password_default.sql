-- Rename the default unzip password from the old clone label to Tunacosplay.

alter table public.posts
  alter column unzip_password set default 'tunacosplay';

update public.posts
set unzip_password = 'tunacosplay'
where unzip_password = 'cosplaytele';

