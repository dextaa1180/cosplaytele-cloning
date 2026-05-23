import { Telegraf } from 'telegraf';
import type { AdminPostDraft } from '@/lib/admin-drafts';

let cachedBot: Telegraf | null = null;

export async function sendPostPublishedTelegramMessage(draft: AdminPostDraft) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const channelId = process.env.TELEGRAM_CHANNEL_ID?.trim();

  if (!botToken || !channelId) {
    return;
  }

  const bot = getTelegramBot(botToken);
  await bot.telegram.sendMessage(channelId, createTelegramPostMessage(draft));
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

  return [
    `📌 ${titleLabel} (${formatTelegramDate(new Date())})`,
    '',
    draft.title.trim(),
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
