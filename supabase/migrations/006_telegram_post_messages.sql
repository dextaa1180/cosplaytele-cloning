-- Stores Telegram channel message ids for published posts.
-- This lets the admin edit/delete flow update the original Telegram post
-- instead of sending duplicate messages.

create table if not exists public.telegram_post_messages (
  post_id uuid primary key references public.posts(id) on delete cascade,
  chat_id text not null,
  message_id bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists telegram_post_messages_chat_message_idx
  on public.telegram_post_messages (chat_id, message_id);

drop trigger if exists set_telegram_post_messages_updated_at on public.telegram_post_messages;
create trigger set_telegram_post_messages_updated_at
before update on public.telegram_post_messages
for each row execute function public.set_updated_at();

alter table public.telegram_post_messages enable row level security;
