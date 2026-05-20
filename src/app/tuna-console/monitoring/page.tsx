import Link from 'next/link';
import { Download, Eye, Flame, MousePointerClick, Users } from 'lucide-react';
import {
  getMonitoringSummary,
  type MonitoringContentItem,
  type MonitoringSummary,
} from '@/lib/analytics';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const numberFormatter = new Intl.NumberFormat('en-US');

export default async function MonitoringPage() {
  const { errorMessage, summary } = await loadMonitoringSummary();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
            Monitoring
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Track unique visits, download clicks, and the content with the
            strongest demand.
          </p>
        </div>
        <span className="inline-flex w-fit items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950 dark:text-cyan-200">
          Dedupe per visitor per day
        </span>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          {errorMessage}
        </div>
      )}

      {!summary.configured && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Supabase belum dikonfigurasi, jadi monitoring belum bisa membaca data
          produksi.
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          icon={Users}
          label="Daily Visits"
          value={summary.visits.today}
          helper="Unique visitors today"
        />
        <MetricCard
          icon={Users}
          label="Weekly Visits"
          value={summary.visits.week}
          helper="Unique visitors in 7 days"
        />
        <MetricCard
          icon={Users}
          label="Monthly Visits"
          value={summary.visits.month}
          helper="Unique visitors in 30 days"
        />
        <MetricCard
          icon={MousePointerClick}
          label="Daily Downloads"
          value={summary.downloads.today}
          helper="Unique download clicks today"
        />
        <MetricCard
          icon={Download}
          label="Weekly Downloads"
          value={summary.downloads.week}
          helper="Unique download clicks in 7 days"
        />
        <MetricCard
          icon={Download}
          label="Monthly Downloads"
          value={summary.downloads.month}
          helper="Unique download clicks in 30 days"
        />
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950 dark:text-white">
              Most In Demand
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Ranked by unique views plus unique download clicks in the last 30
              days.
            </p>
          </div>
          <Flame className="h-5 w-5 text-cyan-500" aria-hidden="true" />
        </div>

        {summary.topContent.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Content</th>
                  <th className="px-5 py-3 font-semibold">Source</th>
                  <th className="px-5 py-3 font-semibold">Views</th>
                  <th className="px-5 py-3 font-semibold">Downloads</th>
                  <th className="px-5 py-3 font-semibold">Demand</th>
                  <th className="px-5 py-3 font-semibold">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {summary.topContent.map((item) => (
                  <DemandRow item={item} key={item.id} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            Data monitoring akan muncul setelah visitor membuka konten atau klik
            download.
          </div>
        )}
      </section>
    </div>
  );
}

async function loadMonitoringSummary() {
  try {
    return {
      errorMessage: '',
      summary: await getMonitoringSummary(),
    };
  } catch (error) {
    return {
      errorMessage:
        getErrorMessage(error) ||
        'Monitoring belum siap. Jalankan migration analytics terlebih dahulu.',
      summary: {
        configured: true,
        downloads: { month: 0, today: 0, week: 0 },
        topContent: [],
        visits: { month: 0, today: 0, week: 0 },
      } satisfies MonitoringSummary,
    };
  }
}

function MetricCard({
  helper,
  icon: Icon,
  label,
  value,
}: {
  helper: string;
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
            {numberFormatter.format(value)}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {helper}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-300">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function DemandRow({ item }: { item: MonitoringContentItem }) {
  return (
    <tr className="text-slate-700 dark:text-slate-200">
      <td className="px-5 py-4">
        <div className="max-w-sm">
          <p className="truncate font-semibold text-slate-950 dark:text-white">
            {item.title}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
            {item.cosplayer} / {item.character}
          </p>
        </div>
      </td>
      <td className="px-5 py-4">
        <div>
          <p className="font-medium">{item.source}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {item.category}
          </p>
        </div>
      </td>
      <td className="px-5 py-4 font-semibold">
        {numberFormatter.format(item.views)}
      </td>
      <td className="px-5 py-4 font-semibold">
        {numberFormatter.format(item.downloads)}
      </td>
      <td className="px-5 py-4 font-semibold">
        {numberFormatter.format(item.score)}
      </td>
      <td className="px-5 py-4">
        <Link
          href={`/${item.slug}`}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-cyan-700 dark:hover:text-cyan-200"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          View
        </Link>
      </td>
    </tr>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return '';
}
