import {
  getPublicTelegramIntegrationSettings,
  saveTelegramIntegrationSettings,
  type TelegramBotOption,
  type TelegramChannelOption,
  type TelegramIntegrationSettings,
} from '@/lib/integration-settings';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return Response.json({
    settings: await getPublicTelegramIntegrationSettings(),
  });
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json().catch(() => null)) as Partial<
      TelegramIntegrationSettings
    > | null;

    if (!payload) {
      return Response.json({ error: 'Invalid settings payload.' }, { status: 400 });
    }

    const settings = await saveTelegramIntegrationSettings({
      activeBotId: sanitizeString(payload.activeBotId),
      botOptions: sanitizeBotOptions(payload.botOptions),
      channelId: sanitizeString(payload.channelId),
      channelOptions: sanitizeChannelOptions(payload.channelOptions),
      postLabel: sanitizeString(payload.postLabel),
      publicSiteUrl: sanitizeString(payload.publicSiteUrl),
      shopUrl: sanitizeString(payload.shopUrl),
    });

    return Response.json({ settings });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to save Telegram settings.',
      },
      { status: 500 },
    );
  }
}

function sanitizeBotOptions(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  const options: TelegramBotOption[] = [];

  value.forEach((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return;
    }

    const record = item as Record<string, unknown>;
    const id = sanitizeString(record.id);
    if (!id || options.some((option) => option.id === id)) {
      return;
    }

    const token = sanitizeString(record.token);

    options.push({
      id,
      label: sanitizeString(record.label) || id,
      token: token === 'configured' ? '' : token,
    });
  });

  return options;
}

function sanitizeChannelOptions(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return null;
      }

      const record = item as Record<string, unknown>;
      const id = sanitizeString(record.id);
      if (!id) {
        return null;
      }

      return {
        id,
        label: sanitizeString(record.label) || id,
      } satisfies TelegramChannelOption;
    })
    .filter((item): item is TelegramChannelOption => item !== null);
}

function sanitizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}
