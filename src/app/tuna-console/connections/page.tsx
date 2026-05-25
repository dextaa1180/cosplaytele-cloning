import {
  Bot,
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  MessageCircle,
  Send,
  Webhook,
} from 'lucide-react';
import { AdminTelegramConnectionForm } from '@/components/admin/AdminTelegramConnectionForm';
import {
  getTelegramIntegrationSettings,
  isTelegramBotTokenConfigured,
  isTelegramIntegrationConfigured,
} from '@/lib/integration-settings';
import { cn } from '@/lib/utils';

type IntegrationStatus = 'connected' | 'partial' | 'not-configured';

interface IntegrationItem {
  description: string;
  fields: Array<{
    configured: boolean;
    label: string;
    required?: boolean;
  }>;
  icon: typeof Bot;
  name: string;
  status: IntegrationStatus;
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function ConnectionsPage() {
  const telegramSettings = await getTelegramIntegrationSettings();
  const telegramBotTokenConfigured = isTelegramBotTokenConfigured();
  const telegramConfigured = isTelegramIntegrationConfigured(telegramSettings);
  const telegramStatus: IntegrationStatus = telegramConfigured
    ? 'connected'
    : telegramBotTokenConfigured || telegramSettings.channelId
      ? 'partial'
      : 'not-configured';
  const whatsappConfigured = Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID,
  );
  const webhookConfigured = Boolean(process.env.NOTIFICATION_WEBHOOK_URL);

  const integrations: IntegrationItem[] = [
    {
      name: 'Telegram Bot',
      description:
        'Auto-send new published content, then edit or delete the same channel message when content changes.',
      icon: Send,
      status: telegramStatus,
      fields: [
        {
          label: 'Bot token',
          configured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
          required: true,
        },
        {
          label: 'Channel ID',
          configured: Boolean(telegramSettings.channelId),
          required: true,
        },
        {
          label: 'Shop link',
          configured: Boolean(telegramSettings.shopUrl),
        },
        {
          label: 'Public site URL',
          configured: Boolean(telegramSettings.publicSiteUrl),
        },
      ],
    },
    {
      name: 'WhatsApp',
      description:
        'Prepared for WhatsApp Cloud API or a WhatsApp provider when you choose the sender account.',
      icon: MessageCircle,
      status: whatsappConfigured ? 'connected' : 'not-configured',
      fields: [
        {
          label: 'Access token',
          configured: Boolean(process.env.WHATSAPP_ACCESS_TOKEN),
          required: true,
        },
        {
          label: 'Phone number ID',
          configured: Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID),
          required: true,
        },
      ],
    },
    {
      name: 'Custom Webhook',
      description:
        'Reserved for Discord, automation platforms, or any custom notification receiver.',
      icon: Webhook,
      status: webhookConfigured ? 'connected' : 'not-configured',
      fields: [
        {
          label: 'Webhook URL',
          configured: webhookConfigured,
          required: true,
        },
      ],
    },
  ];

  const connectedCount = integrations.filter(
    (integration) => integration.status === 'connected',
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950 dark:text-white">
            Connections
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Manage bot and notification channels for published content updates.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-normal text-slate-500 dark:text-slate-400">
            Connected
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
            {connectedCount}/{integrations.length}
          </p>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {integrations.map((integration) => (
          <IntegrationCard key={integration.name} integration={integration} />
        ))}
      </section>

      <AdminTelegramConnectionForm
        botTokenConfigured={telegramBotTokenConfigured}
        initialSettings={telegramSettings}
      />

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
            <Bot className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-950 dark:text-white">
              Secure server-side tokens
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Tokens are read only from server environment variables. This page
              shows whether a connection is configured without printing secret
              values to the browser.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function IntegrationCard({ integration }: { integration: IntegrationItem }) {
  const Icon = integration.icon;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-950 dark:text-white">
              {integration.name}
            </h2>
            <StatusBadge status={integration.status} />
          </div>
        </div>
      </div>

      <p className="mt-4 min-h-16 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {integration.description}
      </p>

      <div className="mt-5 space-y-3">
        {integration.fields.map((field) => (
          <div
            key={field.label}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
          >
            <span className="min-w-0 text-slate-700 dark:text-slate-300">
              {field.label}
              {field.required ? (
                <span className="text-rose-500" aria-label="Required">
                  {' '}
                  *
                </span>
              ) : null}
            </span>
            <span
              className={cn(
                'shrink-0 text-xs font-semibold',
                field.configured
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-slate-500 dark:text-slate-400',
              )}
            >
              {field.configured ? 'Set' : 'Not set'}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: IntegrationStatus }) {
  const statusMap = {
    connected: {
      icon: CheckCircle2,
      label: 'Connected',
      className:
        'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    },
    partial: {
      icon: CircleAlert,
      label: 'Needs setup',
      className:
        'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    },
    'not-configured': {
      icon: CircleDashed,
      label: 'Not configured',
      className:
        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    },
  } satisfies Record<
    IntegrationStatus,
    { className: string; icon: typeof CheckCircle2; label: string }
  >;
  const config = statusMap[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'mt-1 inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-xs font-semibold',
        config.className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}
