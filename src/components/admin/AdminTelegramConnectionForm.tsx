'use client';

import { Activity, Bot, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ADMIN_API_BASE_PATH } from '@/lib/admin-auth';
import type {
  TelegramBotOption,
  TelegramChannelOption,
  TelegramIntegrationSettings,
} from '@/lib/integration-settings';
import { cn } from '@/lib/utils';

interface AdminTelegramConnectionFormProps {
  botTokenConfigured: boolean;
  initialSettings: TelegramIntegrationSettings;
}

type ManageMode = 'bots' | 'channels' | null;
type MessageType = 'error' | 'success';

interface PingResult {
  bot: {
    canJoinGroups: boolean;
    canReadAllGroupMessages: boolean;
    firstName: string;
    id: number | null;
    isBot: boolean;
    supportsInlineQueries: boolean;
    username: string;
  };
  channel: {
    id: number | string | null;
    title: string;
    type: string;
    username: string;
  } | null;
  checkedAt: string;
  latencyMs: number;
  serverUptimeSeconds: number;
}

export function AdminTelegramConnectionForm({
  botTokenConfigured,
  initialSettings,
}: AdminTelegramConnectionFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [manageMode, setManageMode] = useState<ManageMode>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('success');
  const [pingResult, setPingResult] = useState<PingResult | null>(null);

  const activeBot = settings.botOptions.find(
    (botOption) => botOption.id === settings.activeBotId,
  );
  const hasActiveBotToken =
    botTokenConfigured ||
    Boolean(activeBot?.token === 'configured' || activeBot?.token?.trim());
  const isConnected = hasActiveBotToken && Boolean(settings.channelId.trim());

  const activeChannelOptions = useMemo(() => {
    if (
      !settings.channelId ||
      settings.channelOptions.some((option) => option.id === settings.channelId)
    ) {
      return settings.channelOptions;
    }

    return [
      {
        id: settings.channelId,
        label: settings.channelId,
      },
      ...settings.channelOptions,
    ];
  }, [settings.channelId, settings.channelOptions]);

  const activeChannel = activeChannelOptions.find(
    (option) => option.id === settings.channelId,
  );

  const addBotOption = () => {
    const botId = `telegram-bot-${Date.now()}`;
    setSettings((current) => ({
      ...current,
      activeBotId: current.activeBotId || botId,
      botOptions: [
        ...current.botOptions,
        {
          id: botId,
          label: '',
          token: '',
        },
      ],
    }));
    setManageMode('bots');
  };

  const addChannelOption = () => {
    setSettings((current) => ({
      ...current,
      channelOptions: [
        ...current.channelOptions,
        {
          id: '',
          label: '',
        },
      ],
    }));
    setManageMode('channels');
  };

  const updateBotOption = (
    index: number,
    field: keyof TelegramBotOption,
    value: string,
  ) => {
    setSettings((current) => ({
      ...current,
      botOptions: current.botOptions.map((option, optionIndex) =>
        optionIndex === index ? { ...option, [field]: value } : option,
      ),
    }));
  };

  const updateChannelOption = (
    index: number,
    field: keyof TelegramChannelOption,
    value: string,
  ) => {
    setSettings((current) => {
      const nextOptions = current.channelOptions.map((option, optionIndex) =>
        optionIndex === index ? { ...option, [field]: value } : option,
      );
      const previousOption = current.channelOptions[index];
      const nextOption = nextOptions[index];

      return {
        ...current,
        channelId:
          previousOption?.id === current.channelId && field === 'id'
            ? nextOption?.id ?? ''
            : current.channelId,
        channelOptions: nextOptions,
      };
    });
  };

  const removeBotOption = (index: number) => {
    setSettings((current) => {
      const removedOption = current.botOptions[index];
      const nextOptions = current.botOptions.filter(
        (_option, optionIndex) => optionIndex !== index,
      );

      return {
        ...current,
        activeBotId:
          removedOption?.id === current.activeBotId
            ? nextOptions[0]?.id ?? ''
            : current.activeBotId,
        botOptions: nextOptions,
      };
    });
  };

  const removeChannelOption = (index: number) => {
    setSettings((current) => {
      const removedOption = current.channelOptions[index];
      const nextOptions = current.channelOptions.filter(
        (_option, optionIndex) => optionIndex !== index,
      );

      return {
        ...current,
        channelId:
          removedOption?.id === current.channelId ? nextOptions[0]?.id ?? '' : current.channelId,
        channelOptions: nextOptions,
      };
    });
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage('');

    try {
      const payload = {
        ...settings,
        botOptions: settings.botOptions.map((botOption) => ({
          ...botOption,
          token: botOption.token === 'configured' ? '' : botOption.token,
        })),
      } satisfies TelegramIntegrationSettings;
      const response = await fetch(`${ADMIN_API_BASE_PATH}/integrations/telegram`, {
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      });
      const responsePayload = (await response.json().catch(() => null)) as {
        error?: string;
        settings?: TelegramIntegrationSettings;
      } | null;

      if (!response.ok || !responsePayload?.settings) {
        throw new Error(
          responsePayload?.error || 'Unable to save Telegram settings.',
        );
      }

      setSettings(responsePayload.settings);
      setManageMode(null);
      setMessageType('success');
      setMessage('Telegram settings saved to database.');
    } catch (error) {
      setMessageType('error');
      setMessage(
        error instanceof Error ? error.message : 'Unable to save Telegram settings.',
      );
    } finally {
      setSaving(false);
    }
  };

  const pingActiveBot = async () => {
    setPinging(true);
    setPingResult(null);
    setMessage('');

    try {
      const response = await fetch(`${ADMIN_API_BASE_PATH}/integrations/telegram/ping`, {
        body: JSON.stringify({
          botId: settings.activeBotId,
          channelId: settings.channelId,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      const responsePayload = (await response.json().catch(() => null)) as
        | (PingResult & { error?: string })
        | null;

      if (!response.ok || !responsePayload || responsePayload.error) {
        throw new Error(responsePayload?.error || 'Telegram ping failed.');
      }

      setPingResult(responsePayload);
      setMessageType('success');
      setMessage('Telegram bot ping successful.');
    } catch (error) {
      setMessageType('error');
      setMessage(error instanceof Error ? error.message : 'Telegram ping failed.');
    } finally {
      setPinging(false);
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-950 dark:text-white">
            Telegram Bot Settings
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Choose the active bot and channel for automatic content messages.
            Management panels only appear when you add or edit a bot/channel.
          </p>
        </div>
        <span
          className={cn(
            'inline-flex h-7 w-fit items-center rounded-full px-3 text-xs font-semibold',
            isConnected
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
          )}
        >
          {isConnected ? 'Connected' : 'Needs setup'}
        </span>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                Active bot
              </h3>
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                The selected bot sends, edits, and deletes channel posts.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setManageMode('bots')}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Manage
              </button>
              <button
                type="button"
                onClick={addBotOption}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add Bot
              </button>
            </div>
          </div>

          {settings.botOptions.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {settings.botOptions.map((botOption) => (
                <button
                  key={botOption.id}
                  type="button"
                  onClick={() =>
                    setSettings((current) => ({
                      ...current,
                      activeBotId: botOption.id,
                    }))
                  }
                  className={cn(
                    'flex min-h-16 items-center gap-3 rounded-lg border p-3 text-left transition',
                    settings.activeBotId === botOption.id
                      ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900',
                  )}
                >
                  <Bot className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">
                      {botOption.label || botOption.id}
                    </span>
                    <span className="block truncate text-xs opacity-75">
                      {botOption.token
                        ? 'Token saved in database'
                        : 'Token not set'}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <EmptyPanel label="No bot option yet. Add a Telegram bot token." />
          )}
        </div>

        <div className="space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                Active channel
              </h3>
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                The selected channel receives the automatic post message.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setManageMode('channels')}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Manage
              </button>
              <button
                type="button"
                onClick={addChannelOption}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add Channel
              </button>
            </div>
          </div>

          {activeChannelOptions.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {activeChannelOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    setSettings((current) => ({
                      ...current,
                      channelId: option.id,
                    }))
                  }
                  className={cn(
                    'min-h-16 rounded-lg border p-3 text-left transition',
                    settings.channelId === option.id
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-950 ring-2 ring-cyan-100 dark:border-cyan-400 dark:bg-cyan-950/30 dark:text-cyan-100 dark:ring-cyan-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900',
                  )}
                >
                  <span className="block truncate text-sm font-bold">
                    {option.label}
                  </span>
                  <span className="mt-1 block truncate text-xs opacity-75">
                    {option.id}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <EmptyPanel label="No channel option yet. Add a destination channel." />
          )}

          {activeChannel ? (
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-950 dark:text-slate-400">
              Selected: {activeChannel.label} ({activeChannel.id})
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Post label
          </span>
          <input
            value={settings.postLabel}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                postLabel: event.target.value,
              }))
            }
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-950"
            placeholder="ASUPAN"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Shop link
          </span>
          <input
            value={settings.shopUrl}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                shopUrl: event.target.value,
              }))
            }
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-950"
            placeholder="https://tunakaslana.shop/"
          />
        </label>

        <label className="space-y-2 lg:col-span-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Public site URL
          </span>
          <input
            value={settings.publicSiteUrl}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                publicSiteUrl: event.target.value,
              }))
            }
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-950"
            placeholder="https://tunacosplay.site"
          />
          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            Used to build the post link sent by the bot, for example
            https://tunacosplay.site/post-slug.
          </p>
        </label>
      </div>

      {manageMode ? (
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          {manageMode === 'bots' ? (
            <ManageBots
              activeBotId={settings.activeBotId}
              botOptions={settings.botOptions}
              onAdd={addBotOption}
              onRemove={removeBotOption}
              onSelect={(botId) =>
                setSettings((current) => ({ ...current, activeBotId: botId }))
              }
              onUpdate={updateBotOption}
            />
          ) : (
            <ManageChannels
              activeChannelId={settings.channelId}
              channelOptions={settings.channelOptions}
              onAdd={addChannelOption}
              onRemove={removeChannelOption}
              onSelect={(channelId) =>
                setSettings((current) => ({ ...current, channelId }))
              }
              onUpdate={updateChannelOption}
            />
          )}
        </div>
      ) : null}

      <div className="mt-5 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-950 dark:text-white">
              Bot ping test
            </h3>
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
              Tests the active token and channel from the server, then returns bot
              stats without exposing the token.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void pingActiveBot()}
            disabled={pinging || !settings.activeBotId}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-cyan-200 px-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-cyan-900/70 dark:text-cyan-300 dark:hover:bg-cyan-950/30"
          >
            <Activity className="h-4 w-4" aria-hidden="true" />
            {pinging ? 'Testing...' : 'Ping Test'}
          </button>
        </div>

        {pingResult ? <PingResultPanel pingResult={pingResult} /> : null}
      </div>

      {message ? (
        <div
          className={cn(
            'mt-5 rounded-lg border p-4 text-sm',
            messageType === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200'
              : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200',
          )}
        >
          {message}
        </div>
      ) : null}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => void saveSettings()}
          disabled={saving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </section>
  );
}

function ManageBots({
  activeBotId,
  botOptions,
  onAdd,
  onRemove,
  onSelect,
  onUpdate,
}: {
  activeBotId: string;
  botOptions: TelegramBotOption[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onSelect: (botId: string) => void;
  onUpdate: (index: number, field: keyof TelegramBotOption, value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <PanelHeading
        actionLabel="Add Bot"
        description="Edit labels and tokens here. This panel hides after saving."
        onAction={onAdd}
        title="Manage bots"
      />

      {botOptions.length > 0 ? (
        botOptions.map((botOption, index) => (
          <div
            key={`${botOption.id}-${index}`}
            className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_1.5fr_auto_auto]"
          >
            <input
              value={botOption.label}
              onChange={(event) => onUpdate(index, 'label', event.target.value)}
              className="h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-950"
              placeholder="Bot label"
            />
            <input
              value={botOption.token === 'configured' ? '' : botOption.token ?? ''}
              onChange={(event) => onUpdate(index, 'token', event.target.value)}
              className="h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-950"
              placeholder={
                botOption.token === 'configured'
                  ? 'Token saved. Leave blank to keep it.'
                  : 'Telegram bot token'
              }
            />
            <button
              type="button"
              onClick={() => onSelect(botOption.id)}
              className={cn(
                'h-10 rounded-lg px-3 text-sm font-semibold transition',
                activeBotId === botOption.id
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800',
              )}
            >
              {activeBotId === botOption.id ? 'Selected' : 'Use'}
            </button>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-rose-200 px-3 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/70 dark:text-rose-300 dark:hover:bg-rose-950/30"
              aria-label="Remove bot"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))
      ) : (
        <EmptyPanel label="No bot option yet. Add one to start." />
      )}
    </div>
  );
}

function ManageChannels({
  activeChannelId,
  channelOptions,
  onAdd,
  onRemove,
  onSelect,
  onUpdate,
}: {
  activeChannelId: string;
  channelOptions: TelegramChannelOption[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onSelect: (channelId: string) => void;
  onUpdate: (
    index: number,
    field: keyof TelegramChannelOption,
    value: string,
  ) => void;
}) {
  return (
    <div className="space-y-3">
      <PanelHeading
        actionLabel="Add Channel"
        description="Edit channel labels and IDs here. This panel hides after saving."
        onAction={onAdd}
        title="Manage channels"
      />

      {channelOptions.length > 0 ? (
        channelOptions.map((option, index) => (
          <div
            key={`${option.id}-${index}`}
            className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_1fr_auto_auto]"
          >
            <input
              value={option.label}
              onChange={(event) => onUpdate(index, 'label', event.target.value)}
              className="h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-950"
              placeholder="Label, e.g. Main Channel"
            />
            <input
              value={option.id}
              onChange={(event) => onUpdate(index, 'id', event.target.value)}
              className="h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-950"
              placeholder="@channel or -100..."
            />
            <button
              type="button"
              onClick={() => onSelect(option.id)}
              disabled={!option.id}
              className={cn(
                'h-10 rounded-lg px-3 text-sm font-semibold transition',
                activeChannelId === option.id && option.id
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800',
              )}
            >
              {activeChannelId === option.id && option.id ? 'Selected' : 'Use'}
            </button>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-rose-200 px-3 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/70 dark:text-rose-300 dark:hover:bg-rose-950/30"
              aria-label="Remove channel"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))
      ) : (
        <EmptyPanel label="No channel option yet. Add one to start." />
      )}
    </div>
  );
}

function PanelHeading({
  actionLabel,
  description,
  onAction,
  title,
}: {
  actionLabel: string;
  description: string;
  onAction: () => void;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-950 dark:text-white">
          {title}
        </h3>
        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {actionLabel}
      </button>
    </div>
  );
}

function PingResultPanel({ pingResult }: { pingResult: PingResult }) {
  const uptime = formatDuration(pingResult.serverUptimeSeconds);

  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Metric label="Bot Name" value={pingResult.bot.firstName || '-'} />
      <Metric
        label="Username"
        value={pingResult.bot.username ? `@${pingResult.bot.username}` : '-'}
      />
      <Metric label="Latency" value={`${pingResult.latencyMs}ms`} />
      <Metric label="Server Uptime" value={uptime} />
      <Metric
        label="Channel"
        value={pingResult.channel?.title || pingResult.channel?.username || '-'}
      />
      <Metric label="Channel Type" value={pingResult.channel?.type || '-'} />
      <Metric
        label="Groups"
        value={pingResult.bot.canJoinGroups ? 'Allowed' : 'Disabled'}
      />
      <Metric
        label="Checked"
        value={new Date(pingResult.checkedAt).toLocaleString()}
      />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
      <p className="text-xs font-semibold uppercase tracking-normal text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function EmptyPanel({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
      {label}
    </div>
  );
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}
