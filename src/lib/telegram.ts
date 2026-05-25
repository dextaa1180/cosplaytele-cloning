import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Telegraf } from 'telegraf';
import type { AdminPostDraft } from '@/lib/admin-drafts';
import {
  getActiveTelegramBotToken,
  getActiveTelegramChannelIds,
  getTelegramIntegrationSettings,
  type TelegramIntegrationSettings,
} from '@/lib/integration-settings';
import { getSupabaseAdminClient } from '@/lib/supabase/server';

interface TelegramPostMessage {
  chatId: string;
  messageId: number;
  postId: string;
}

type TelegramMessageSnapshot = Record<string, TelegramPostMessage[]>;

const cachedBots = new Map<string, Telegraf>();

const dataDirectory = path.join(process.cwd(), '.data');
const telegramMessagesFile = path.join(dataDirectory, 'telegram-post-messages.json');

export async function syncTelegramPostMessage(draft: AdminPostDraft) {
  const config = await getTelegramConfig();
  if (!config) {
    return;
  }

  const existingMessage = await getStoredTelegramPostMessage(draft.id);
  const messageText = createTelegramPostMessage(draft, config.settings);

  await Promise.all(
    config.channelIds.map(async (channelId) => {
      const channelMessage = existingMessage.find(
        (message) => message.chatId === channelId,
      );

      if (channelMessage) {
        await editTelegramMessage(channelMessage, messageText, config.botToken);
        return;
      }

      const sentMessage = await sendTelegramMessage(
        channelId,
        messageText,
        config.botToken,
      );
      await storeTelegramPostMessage({
        chatId: channelId,
        messageId: sentMessage.message_id,
        postId: draft.id,
      });
    }),
  );
}

export async function deleteTelegramPostMessage(postId: string) {
  const config = await getTelegramConfig();
  if (!config) {
    return;
  }

  const existingMessages = await getStoredTelegramPostMessage(postId);
  if (existingMessages.length === 0) {
    return;
  }

  try {
    await Promise.allSettled(
      existingMessages.map((message) =>
        getTelegramBot(config.botToken).telegram.deleteMessage(
          message.chatId,
          message.messageId,
        ),
      ),
    );
  } finally {
    await removeStoredTelegramPostMessage(postId);
  }
}

async function getTelegramConfig() {
  const settings = await getTelegramIntegrationSettings();
  const botToken = getActiveTelegramBotToken(settings);
  const channelIds = getActiveTelegramChannelIds(settings);

  if (!botToken || channelIds.length === 0) {
    return null;
  }

  return { botToken, channelIds, settings };
}

async function sendTelegramMessage(
  chatId: string,
  messageText: string,
  botToken: string,
) {
  return getTelegramBot(botToken).telegram.sendMessage(chatId, messageText, {
    link_preview_options: {
      is_disabled: true,
    },
  });
}

async function editTelegramMessage(
  message: TelegramPostMessage,
  messageText: string,
  botToken: string,
) {
  try {
    await getTelegramBot(botToken).telegram.editMessageText(
      message.chatId,
      message.messageId,
      undefined,
      messageText,
      {
        link_preview_options: {
          is_disabled: true,
        },
      },
    );
  } catch (error) {
    if (!isMessageNotModifiedError(error)) {
      throw error;
    }
  }
}

function getTelegramBot(botToken: string) {
  const cachedBot = cachedBots.get(botToken);
  if (cachedBot) {
    return cachedBot;
  }

  const bot = new Telegraf(botToken);
  cachedBots.set(botToken, bot);
  return bot;
}

function createTelegramPostMessage(
  draft: AdminPostDraft,
  settings: TelegramIntegrationSettings,
) {
  const titleLabel = settings.postLabel || 'ASUPAN';
  const siteUrl = getPublicSiteUrl(settings);
  const shopUrl = settings.shopUrl || 'https://tunakaslana.shop/';
  const postUrl = `${siteUrl}/${encodeURIComponent(draft.slug)}`;
  const postDate = new Date(draft.createdAt || Date.now());
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
    `✨ Appear In: ${draft.source.trim()}`,
    '',
    `🖼 Photos: ${photoLabel}`,
    `🎬 Videos: ${videoLabel}`,
    `📦 File Size: ${fileSizeLabel}`,
    '',
    'Preview & Download di website ⬇️',
    'Link:',
    `➡️ ${postUrl}`,
    '❗️ Yang dari tiktok gabung channel dulu atau salin aja terus buka di browser kalian masing masing, kalau langsung kalian buka dari tiktok gak bakal bisa.',
    '',
    'KUNJUNGI ETALASE TUNA 🛍',
    `➡️ ${shopUrl}`,
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
      .eq('post_id', postId);

    if (!error && data) {
      return data.map((message) => ({
        chatId: message.chat_id as string,
        messageId: Number(message.message_id),
        postId: message.post_id as string,
      })) satisfies TelegramPostMessage[];
    }

    if (error && error.code !== 'PGRST116') {
      console.error('Unable to read Telegram post message mapping.', error.message);
    }
  }

  const localMessages = await readLocalTelegramMessages();
  const storedMessages = localMessages[postId] ?? [];
  return Array.isArray(storedMessages) ? storedMessages : [storedMessages];
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
      { onConflict: 'post_id,chat_id' },
    );

    if (!error) {
      return;
    }

    console.error('Unable to store Telegram post message mapping.', error.message);
  }

  const localMessages = await readLocalTelegramMessages();
  const storedMessages = localMessages[message.postId] ?? [];
  const nextMessages = storedMessages.filter(
    (storedMessage) => storedMessage.chatId !== message.chatId,
  );
  localMessages[message.postId] = [...nextMessages, message];
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

function getPublicSiteUrl(settings: TelegramIntegrationSettings) {
  const siteUrl =
    settings.publicSiteUrl ||
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
