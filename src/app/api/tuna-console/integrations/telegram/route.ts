import {
  getTelegramIntegrationSettings,
  saveTelegramIntegrationSettings,
  type TelegramChannelOption,
  type TelegramIntegrationSettings,
} from '@/lib/integration-settings';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return Response.json({
    settings: await getTelegramIntegrationSettings(),
  });
}

export async function PATCH(request: Request) {
  const payload = (await request.json().catch(() => null)) as Partial<
    TelegramIntegrationSettings
  > | null;

  if (!payload) {
    return Response.json({ error: 'Invalid settings payload.' }, { status: 400 });
  }

  const settings = await saveTelegramIntegrationSettings({
    channelId: sanitizeString(payload.channelId),
    channelOptions: sanitizeChannelOptions(payload.channelOptions),
    postLabel: sanitizeString(payload.postLabel),
    publicSiteUrl: sanitizeString(payload.publicSiteUrl),
    shopUrl: sanitizeString(payload.shopUrl),
  });

  return Response.json({ settings });
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
