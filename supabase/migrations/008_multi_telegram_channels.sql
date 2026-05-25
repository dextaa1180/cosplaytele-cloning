-- Allow one post to keep Telegram message ids for multiple destination channels.

alter table public.telegram_post_messages
  drop constraint if exists telegram_post_messages_pkey;

alter table public.telegram_post_messages
  add constraint telegram_post_messages_pkey primary key (post_id, chat_id);

