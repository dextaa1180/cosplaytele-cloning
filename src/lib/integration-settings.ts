import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getSupabaseAdminClient } from '@/lib/supabase/server';

export interface TelegramChannelOption {
  id: string;
  label: string;
}

export interface TelegramIntegrationSettings {
  channelId: string;
  channelOptions: TelegramChannelOption[];
  postLabel: string;
  publicSiteUrl: string;
  shopUrl: string;
}

const dataDirectory = path.join(process.cwd(), '.data');
const integrationSettingsFile = path.join(dataDirectory, 'integration-settings.json');
const telegramSettingsKey = 'telegram';

type IntegrationSettingsSnapshot = Record<string, unknown>;

interface IntegrationSettingRow {
  value: unknown;
}

export function isTelegramBotTokenConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim());
}

export async function getTelegramIntegrationSettings() {
  const savedSettings = await readIntegrationSetting(telegramSettingsKey);
  return normalizeTelegramIntegrationSettings(savedSettings);
}

export async function saveTelegramIntegrationSettings(
  settings: TelegramIntegrationSettings,
) {
  const normalizedSettings = normalizeTelegramIntegrationSettings(settings);
  await writeIntegrationSetting(telegramSettingsKey, normalizedSettings);
  return normalizedSettings;
}

export function isTelegramIntegrationConfigured(
  settings: TelegramIntegrationSettings,
) {
  return Boolean(isTelegramBotTokenConfigured() && settings.channelId);
}

function normalizeTelegramIntegrationSettings(value: unknown) {
  const source = isRecord(value) ? value : {};
  const envChannelId = process.env.TELEGRAM_CHANNEL_ID?.trim() ?? '';
  const channelId = getStringValue(source.channelId).trim() || envChannelId;
  const channelOptions = getChannelOptions(source.channelOptions);
  const postLabel =
    getStringValue(source.postLabel).trim() ||
    process.env.TELEGRAM_POST_LABEL?.trim() ||
    'ASUPAN';
  const shopUrl =
    getStringValue(source.shopUrl).trim() ||
    process.env.TELEGRAM_SHOP_URL?.trim() ||
    'https://tunakaslana.shop/';
  const publicSiteUrl =
    getStringValue(source.publicSiteUrl).trim() ||
    process.env.PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.PUBLIC_STORAGE_BASE_URL?.trim() ||
    'https://tunacosplay.site';

  return {
    channelId,
    channelOptions: ensureActiveChannelOption(channelOptions, channelId),
    postLabel,
    publicSiteUrl: removeTrailingSlashes(publicSiteUrl),
    shopUrl,
  } satisfies TelegramIntegrationSettings;
}

function getChannelOptions(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const id = getStringValue(item.id).trim();
      if (!id) {
        return null;
      }

      return {
        id,
        label: getStringValue(item.label).trim() || id,
      } satisfies TelegramChannelOption;
    })
    .filter((item): item is TelegramChannelOption => item !== null)
    .filter(
      (item, index, items) =>
        items.findIndex((candidate) => candidate.id === item.id) === index,
    );
}

function ensureActiveChannelOption(
  options: TelegramChannelOption[],
  channelId: string,
) {
  if (!channelId || options.some((option) => option.id === channelId)) {
    return options;
  }

  return [
    {
      id: channelId,
      label: channelId,
    },
    ...options,
  ];
}

async function readIntegrationSetting(key: string) {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('integration_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (!error && data) {
      return (data as IntegrationSettingRow).value;
    }

    if (error && error.code !== 'PGRST116') {
      console.error('Unable to read integration settings.', error.message);
    }
  }

  const localSettings = await readLocalIntegrationSettings();
  return localSettings[key] ?? null;
}

async function writeIntegrationSetting(key: string, value: unknown) {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const { error } = await supabase.from('integration_settings').upsert(
      {
        key,
        value,
      },
      { onConflict: 'key' },
    );

    if (!error) {
      return;
    }

    console.error('Unable to write integration settings.', error.message);
  }

  const localSettings = await readLocalIntegrationSettings();
  localSettings[key] = value;
  await writeLocalIntegrationSettings(localSettings);
}

async function readLocalIntegrationSettings() {
  try {
    const contents = await readFile(integrationSettingsFile, 'utf8');
    const parsed = JSON.parse(contents) as unknown;
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

async function writeLocalIntegrationSettings(settings: IntegrationSettingsSnapshot) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(integrationSettingsFile, JSON.stringify(settings, null, 2));
}

function getStringValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function removeTrailingSlashes(value: string) {
  return value.replace(/\/+$/, '');
}
