import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Telegraf } from 'telegraf';
import type { AdminPostDraft } from '@/lib/admin-drafts';
import { getSupabaseAdminClient } from '@/lib/supabase/server';

interface TelegramPostMessage {
  chatId: string;
  messageId: number;
  postId: string;
}

type TelegramMessageSnapshot = Record<string, TelegramPostMessage>;

let cachedBot: Telegraf | null = null;

const dataDirectory = path.join(process.cwd(), '.data');
const telegramMessagesFile = path.join(dataDirectory, 'telegram-post-messages.json');

export async function syncTelegramPostMessage(draft: AdminPostDraft) {
  const config = getTelegramConfig();
  if (!config) {
    return;
  }

  const existingMessage = await getStoredTelegramPostMessage(draft.id);
  const messageText = createTelegramPostMessage(draft);

  if (existingMessage) {
    await editTelegramMessage(existingMessage, messageText);
    return;
  }

  const sentMessage = await sendTelegramMessage(config.channelId, messageText);
  await storeTelegramPostMessage({
    chatId: config.channelId,
    messageId: sentMessage.message_id,
    postId: draft.id,
  });
}

export async function deleteTelegramPostMessage(postId: string) {
  const config = getTelegramConfig();
  if (!config) {
    return;
  }

  const existingMessage = await getStoredTelegramPostMessage(postId);
  if (!existingMessage) {
    return;
  }

  try {
    await getTelegramBot(config.botToken).telegram.deleteMessage(
      existingMessage.chatId,
      existingMessage.messageId,
    );
  } finally {
    await removeStoredTelegramPostMessage(postId);
  }
}

function getTelegramConfig() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const channelId = process.env.TELEGRAM_CHANNEL_ID?.trim();

  if (!botToken || !channelId) {
    return null;
  }

  return { botToken, channelId };
}

async function sendTelegramMessage(chatId: string, messageText: string) {
  const config = getTelegramConfig();
  if (!config) {
    throw new Error('Telegram bot is not configured.');
  }

  return getTelegramBot(config.botToken).telegram.sendMessage(chatId, messageText);
}

async function editTelegramMessage(
  message: TelegramPostMessage,
  messageText: string,
) {
  const config = getTelegramConfig();
  if (!config) {
    return;
  }

  try {
    await getTelegramBot(config.botToken).telegram.editMessageText(
      message.chatId,
      message.messageId,
      undefined,
      messageText,
    );
  } catch (error) {
    if (!isMessageNotModifiedError(error)) {
      throw error;
    }
  }
}

function getTelegramBot(botToken: string) {
  if (!cachedBot) {
    cachedBot = new Telegraf(botToken);
  }

  return cachedBot;
}

function createTelegramPostMessage(draft: AdminPostDraft) {
  const titleLabel = process.env.TELEGRAM_POST_LABEL?.trim() || 'ASUPAN';
  const siteUrl = getPublicSiteUrl();
  const shopUrl = process.env.TELEGRAM_SHOP_URL?.trim() || 'https://tunakaslana.shop/';
  const postUrl = `${siteUrl}/${encodeURIComponent(draft.slug)}`;
  const postDate = new Date(draft.createdAt || Date.now());
  const tagLabel = draft.tags.length > 0 ? draft.tags.join(', ') : '-';
  const photoLabel = `${draft.photoCount} photo${draft.photoCount === 1 ? '' : 's'}`;
  const videoLabel = `${draft.videoCount} video${draft.videoCount === 1 ? '' : 's'}`;
  const fileSizeLabel = draft.fileSize.trim() || '-';

  return [
    `📌 ${titleLabel} (${formatTelegramDate(postDate)})`,
    '',
    draft.title.trim(),
    '',
    `👤 Cosplayer: ${draft.cosplayer.trim()}`,
    `🎭 Character: ${draft.character.trim()}`,
    `🎮 Appear In: ${draft.source.trim()}`,
    `📂 Category: ${draft.category}`,
    `🏷 Tags: ${tagLabel}`,
    `🖼 Photos: ${photoLabel}`,
    `🎬 Videos: ${videoLabel}`,
    `📦 File Size: ${fileSizeLabel}`,
    '',
    '',
    'Preview & Download di website ⬇️',
    'Link:',
    `➡️ ${postUrl}`,
    '❗️ Yang dari tiktok gabung channel dulu atau salin aja terus buka di browser kalian masing masing, kalau langsung kalian buka dari tiktok gak bakal bisa.',
    '',
    '',
    'KUNJUNGI ETALASE TUNA 🛍',
    `➡️ ${shopUrl}`,
    '',
    '',
    'Thank you | Terima Kasih 🥰',
  ].join('\n');
}

async function getStoredTelegramPostMessage(postId: string) {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('telegram_post_messages')
      .select('post_id, chat_id, message_id')
      .eq('post_id', postId)
      .maybeSingle();

    if (!error && data) {
      return {
        chatId: data.chat_id as string,
        messageId: Number(data.message_id),
        postId: data.post_id as string,
      } satisfies TelegramPostMessage;
    }

    if (error && error.code !== 'PGRST116') {
      console.error('Unable to read Telegram post message mapping.', error.message);
    }
  }

  const localMessages = await readLocalTelegramMessages();
  return localMessages[postId] ?? null;
}

async function storeTelegramPostMessage(message: TelegramPostMessage) {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const { error } = await supabase.from('telegram_post_messages').upsert(
      {
        chat_id: message.chatId,
        message_id: message.messageId,
        post_id: message.postId,
      },
      { onConflict: 'post_id' },
    );

    if (!error) {
      return;
    }

    console.error('Unable to store Telegram post message mapping.', error.message);
  }

  const localMessages = await readLocalTelegramMessages();
  localMessages[message.postId] = message;
  await writeLocalTelegramMessages(localMessages);
}

async function removeStoredTelegramPostMessage(postId: string) {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const { error } = await supabase
      .from('telegram_post_messages')
      .delete()
      .eq('post_id', postId);

    if (!error) {
      return;
    }

    console.error('Unable to remove Telegram post message mapping.', error.message);
  }

  const localMessages = await readLocalTelegramMessages();
  delete localMessages[postId];
  await writeLocalTelegramMessages(localMessages);
}

async function readLocalTelegramMessages() {
  try {
    const contents = await readFile(telegramMessagesFile, 'utf8');
    return JSON.parse(contents) as TelegramMessageSnapshot;
  } catch {
    return {};
  }
}

async function writeLocalTelegramMessages(messages: TelegramMessageSnapshot) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(telegramMessagesFile, JSON.stringify(messages, null, 2));
}

function getPublicSiteUrl() {
  const siteUrl =
    process.env.PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.PUBLIC_STORAGE_BASE_URL?.trim() ||
    'https://tunacosplay.site';

  return siteUrl.replace(/\/+$/, '');
}

function formatTelegramDate(date: Date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);

  return `${day}/${month}/${year}`;
}

function isMessageNotModifiedError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.toLowerCase().includes('message is not modified')
  );
}
