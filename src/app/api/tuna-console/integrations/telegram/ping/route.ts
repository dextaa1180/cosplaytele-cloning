import {
  getTelegramBotToken,
  getTelegramIntegrationSettings,
} from '@/lib/integration-settings';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface TelegramApiResponse<T> {
  description?: string;
  ok: boolean;
  result?: T;
}

interface TelegramBotInfo {
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  first_name?: string;
  id?: number;
  is_bot?: boolean;
  supports_inline_queries?: boolean;
  username?: string;
}

interface TelegramChatInfo {
  id?: number | string;
  title?: string;
  type?: string;
  username?: string;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => null)) as {
      botId?: string;
      channelId?: string;
    } | null;
    const settings = await getTelegramIntegrationSettings();
    const botId = payload?.botId?.trim() || settings.activeBotId;
    const channelId =
      payload?.channelId?.trim() || settings.channelIds[0] || settings.channelId;
    const botToken = getTelegramBotToken(settings, botId);

    if (!botToken) {
      return Response.json(
        { error: 'Telegram bot token is not configured.' },
        { status: 400 },
      );
    }

    const startedAt = Date.now();
    const botInfo = await callTelegram<TelegramBotInfo>(botToken, 'getMe');
    let channelInfo: TelegramChatInfo | null = null;

    if (channelId) {
      channelInfo = await callTelegram<TelegramChatInfo>(botToken, 'getChat', {
        chat_id: channelId,
      });
    }

    return Response.json({
      bot: {
        canJoinGroups: Boolean(botInfo.can_join_groups),
        canReadAllGroupMessages: Boolean(botInfo.can_read_all_group_messages),
        firstName: botInfo.first_name ?? '',
        id: botInfo.id ?? null,
        isBot: Boolean(botInfo.is_bot),
        supportsInlineQueries: Boolean(botInfo.supports_inline_queries),
        username: botInfo.username ?? '',
      },
      channel: channelInfo
        ? {
            id: channelInfo.id ?? null,
            title: channelInfo.title ?? '',
            type: channelInfo.type ?? '',
            username: channelInfo.username ?? '',
          }
        : null,
      checkedAt: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
      serverUptimeSeconds: Math.round(process.uptime()),
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to ping Telegram bot.',
      },
      { status: 502 },
    );
  }
}

async function callTelegram<T>(
  botToken: string,
  method: string,
  params?: Record<string, string>,
) {
  const url = new URL(`https://api.telegram.org/bot${botToken}/${method}`);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url, { cache: 'no-store' });
  const payload = (await response.json().catch(() => null)) as
    | TelegramApiResponse<T>
    | null;

  if (!response.ok || !payload?.ok || !payload.result) {
    throw new Error(
      payload?.description || `Telegram ${method} request failed.`,
    );
  }

  return payload.result;
}
