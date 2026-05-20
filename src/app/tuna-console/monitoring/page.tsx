import Link from 'next/link';
import { Download, Eye, Flame, MousePointerClick, Users } from 'lucide-react';
import {
  getMonitoringSummary,
  type MonitoringChartPoint,
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

      <section className="grid gap-4 xl:grid-cols-2">
        <LineChartCard
          title="Last 24 Hours"
          description="Unique visits and unique download clicks by hour."
          points={summary.charts.hourly}
        />
        <LineChartCard
          title="Last 7 Days"
          description="Daily unique visits and download clicks."
          points={summary.charts.daily}
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
        charts: {
          daily: [],
          hourly: [],
        },
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

function LineChartCard({
  description,
  points,
  title,
}: {
  description: string;
  points: MonitoringChartPoint[];
  title: string;
}) {
  const chartPoints = points.length > 0 ? points : [{ downloads: 0, label: '', visits: 0 }];
  const maxValue = getChartMax(chartPoints);
  const gridValues = getGridValues(maxValue);
  const gradientId = `chart-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-fill`;
  const visitPath = buildLinePath(chartPoints, 'visits', maxValue);
  const downloadPath = buildLinePath(chartPoints, 'downloads', maxValue);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">
              {title}
            </h2>
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            visits
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            downloads
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
        <svg
          viewBox="0 0 640 260"
          className="h-64 w-full"
          role="img"
          aria-label={`${title} chart`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>
          {gridValues.map((value) => {
            const y = chartY(value, maxValue);

            return (
              <g key={value}>
                <line
                  x1="44"
                  x2="622"
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                />
                <text
                  x="30"
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-500 text-[11px] dark:fill-slate-400"
                >
                  {value}
                </text>
              </g>
            );
          })}
          <path
            d={`${visitPath} L ${chartX(chartPoints.length - 1, chartPoints.length)} 214 L 44 214 Z`}
            fill={`url(#${gradientId})`}
          />
          <path
            d={visitPath}
            fill="none"
            stroke="#2563eb"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
          <path
            d={downloadPath}
            fill="none"
            stroke="#06b6d4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
          {chartPoints.map((point, index) => (
            <g key={`${point.label}-${index}`}>
              {(index === 0 || index === chartPoints.length - 1 || index % 3 === 0) && (
                <text
                  x={chartX(index, chartPoints.length)}
                  y="242"
                  textAnchor="middle"
                  className="fill-slate-500 text-[11px] dark:fill-slate-400"
                >
                  {point.label}
                </text>
              )}
            </g>
          ))}
        </svg>
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

function buildLinePath(
  points: MonitoringChartPoint[],
  key: 'downloads' | 'visits',
  maxValue: number,
) {
  return points
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${chartX(index, points.length)} ${chartY(point[key], maxValue)}`;
    })
    .join(' ');
}

function chartX(index: number, total: number) {
  const left = 44;
  const width = 578;

  if (total <= 1) {
    return left;
  }

  return left + (width / (total - 1)) * index;
}

function chartY(value: number, maxValue: number) {
  const top = 18;
  const height = 196;
  return top + height - (value / maxValue) * height;
}

function getChartMax(points: MonitoringChartPoint[]) {
  const rawMax = Math.max(
    1,
    ...points.flatMap((point) => [point.downloads, point.visits]),
  );
  const magnitude = 10 ** Math.floor(Math.log10(rawMax));
  return Math.ceil(rawMax / magnitude) * magnitude;
}

function getGridValues(maxValue: number) {
  const step = Math.max(1, Math.ceil(maxValue / 4));
  return [0, step, step * 2, step * 3, step * 4].filter(
    (value) => value <= maxValue,
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return '';
}
