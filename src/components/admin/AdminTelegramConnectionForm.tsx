'use client';

import { Bot, Plus, Save, Trash2 } from 'lucide-react';
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

export function AdminTelegramConnectionForm({
  botTokenConfigured,
  initialSettings,
}: AdminTelegramConnectionFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('success');

  const hasChannel = Boolean(settings.channelId.trim());
  const activeBot = settings.botOptions.find(
    (botOption) => botOption.id === settings.activeBotId,
  );
  const hasActiveBotToken =
    botTokenConfigured ||
    Boolean(activeBot?.token === 'configured' || activeBot?.token?.trim());
  const isConnected = hasActiveBotToken && hasChannel;

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

  const updateBotOption = (
    index: number,
    field: keyof TelegramBotOption,
    value: string,
  ) => {
    setSettings((current) => {
      const nextOptions = current.botOptions.map((option, optionIndex) =>
        optionIndex === index ? { ...option, [field]: value } : option,
      );

      return {
        ...current,
        botOptions: nextOptions,
      };
    });
  };

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
      const nextChannelId =
        previousOption?.id === current.channelId && field === 'id'
          ? nextOption?.id ?? ''
          : current.channelId;

      return {
        ...current,
        channelId: nextChannelId,
        channelOptions: nextOptions,
      };
    });
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
      setMessageType('success');
      setMessage('Telegram settings saved.');
    } catch (error) {
      setMessageType('error');
      setMessage(
        error instanceof Error ? error.message : 'Unable to save Telegram settings.',
      );
    } finally {
      setSaving(false);
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
            Add Telegram bot tokens, choose the active bot and channel, then
            adjust the links used inside the channel message.
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

      <div className="mt-5 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-950 dark:text-white">
              Active bot
            </h3>
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
              Select which bot token will send, edit, and delete channel posts.
            </p>
          </div>
        </div>

        {settings.botOptions.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
                    {botOption.token ? 'Token set' : 'Token not set'}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No bot option yet. Add at least one Telegram bot token.
          </div>
        )}
      </div>

      <div className="mt-6 space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-950 dark:text-white">
            Active channel
          </h3>
          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            Pick one destination channel. This replaces the dropdown so the
            layout stays tidy on mobile and desktop.
          </p>
        </div>

        {activeChannelOptions.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
                  'min-h-14 rounded-lg border p-3 text-left transition',
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
          <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No channel option yet. Add a channel below, then select it here.
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
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

      <div className="mt-6 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-950 dark:text-white">
              Bot options
            </h3>
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
              Saved tokens are hidden after saving. Leave token blank to keep an
              existing saved token.
            </p>
          </div>
          <button
            type="button"
            onClick={addBotOption}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Bot
          </button>
        </div>

        {settings.botOptions.length > 0 ? (
          <div className="space-y-3">
            {settings.botOptions.map((botOption, index) => (
              <div
                key={`${botOption.id}-${index}`}
                className="grid gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800 md:grid-cols-[1fr_1.5fr_auto_auto]"
              >
                <input
                  value={botOption.label}
                  onChange={(event) =>
                    updateBotOption(index, 'label', event.target.value)
                  }
                  className="h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-950"
                  placeholder="Bot label"
                />
                <input
                  value={botOption.token === 'configured' ? '' : botOption.token ?? ''}
                  onChange={(event) =>
                    updateBotOption(index, 'token', event.target.value)
                  }
                  className="h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-950"
                  placeholder={
                    botOption.token === 'configured'
                      ? 'Token saved. Leave blank to keep it.'
                      : 'Telegram bot token'
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setSettings((current) => ({
                      ...current,
                      activeBotId: botOption.id,
                    }))
                  }
                  className={cn(
                    'h-10 rounded-lg px-3 text-sm font-semibold transition',
                    settings.activeBotId === botOption.id
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800',
                  )}
                >
                  {settings.activeBotId === botOption.id ? 'Selected' : 'Use'}
                </button>
                <button
                  type="button"
                  onClick={() => removeBotOption(index)}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-rose-200 px-3 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/70 dark:text-rose-300 dark:hover:bg-rose-950/30"
                  aria-label="Remove bot"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No bot option yet. Add at least one Telegram bot token.
          </div>
        )}
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-950 dark:text-white">
              Channel options
            </h3>
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
              Add channel username or numeric chat ID manually. Telegram bots
              cannot list all joined channels automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={addChannelOption}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Channel
          </button>
        </div>

        {settings.channelOptions.length > 0 ? (
          <div className="space-y-3">
            {settings.channelOptions.map((option, index) => (
              <div
                key={`${option.id}-${index}`}
                className="grid gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800 md:grid-cols-[1fr_1fr_auto_auto]"
              >
                <input
                  value={option.label}
                  onChange={(event) =>
                    updateChannelOption(index, 'label', event.target.value)
                  }
                  className="h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-950"
                  placeholder="Label, e.g. Main Channel"
                />
                <input
                  value={option.id}
                  onChange={(event) =>
                    updateChannelOption(index, 'id', event.target.value)
                  }
                  className="h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-950"
                  placeholder="@channel or -100..."
                />
                <button
                  type="button"
                  onClick={() =>
                    setSettings((current) => ({
                      ...current,
                      channelId: option.id,
                    }))
                  }
                  disabled={!option.id}
                  className={cn(
                    'h-10 rounded-lg px-3 text-sm font-semibold transition',
                    settings.channelId === option.id && option.id
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800',
                  )}
                >
                  {settings.channelId === option.id && option.id
                    ? 'Selected'
                    : 'Use'}
                </button>
                <button
                  type="button"
                  onClick={() => removeChannelOption(index)}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-rose-200 px-3 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/70 dark:text-rose-300 dark:hover:bg-rose-950/30"
                  aria-label="Remove channel"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No channel option yet. Add at least one channel destination.
          </div>
        )}
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
