import { createHash } from 'node:crypto';
import { getSupabaseAdminClient } from '@/lib/supabase/server';

type AnalyticsEventType = 'view' | 'download';
type DownloadProvider = '' | 'mediafire' | 'telegram' | 'terabox' | 'gofile';

interface TrackAnalyticsInput {
  eventType?: AnalyticsEventType;
  path: string;
  postId?: string;
  provider?: DownloadProvider;
  request: Request;
  visitorId?: string;
}

interface SiteVisitRow {
  first_path: string;
  last_path: string;
  referrer: string | null;
  user_agent: string | null;
  visit_date: string;
  visitor_hash: string;
}

interface ContentEventRow {
  event_date: string;
  event_type: AnalyticsEventType;
  path: string;
  post_id: string;
  provider: DownloadProvider;
  visitor_hash: string;
}

interface MonitoringPostRow {
  category: string;
  character: string;
  cosplayer: string;
  id: string;
  slug: string;
  source: string;
  title: string;
}

interface MonitoringEventRow {
  event_type: AnalyticsEventType;
  post_id: string;
  provider: DownloadProvider;
}

interface MonitoringTimestampRow {
  created_at?: string;
  event_date?: string;
  first_seen_at?: string;
  visit_date?: string;
}

export interface MonitoringChartPoint {
  downloads: number;
  label: string;
  visits: number;
}

export interface MonitoringContentItem {
  category: string;
  character: string;
  cosplayer: string;
  downloads: number;
  id: string;
  score: number;
  slug: string;
  source: string;
  title: string;
  views: number;
}

export interface MonitoringSummary {
  charts: {
    daily: MonitoringChartPoint[];
    hourly: MonitoringChartPoint[];
  };
  configured: boolean;
  downloads: {
    today: number;
    week: number;
    month: number;
  };
  topContent: MonitoringContentItem[];
  visits: {
    today: number;
    week: number;
    month: number;
  };
}

const analyticsSaltFallback = 'tunacosplay-analytics';
const ignoredPathPrefixes = ['/api', '/tuna-console', '/tuna-signin'];

export async function trackAnalyticsEvent({
  eventType,
  path,
  postId,
  provider = '',
  request,
  visitorId,
}: TrackAnalyticsInput) {
  const supabase = getSupabaseAdminClient();
  const normalizedPath = normalizePath(path);

  if (!supabase || shouldIgnorePath(normalizedPath)) {
    return;
  }

  const today = getDateKey(new Date());
  const visitorHash = getVisitorHash(request, visitorId);
  const userAgent = request.headers.get('user-agent')?.slice(0, 500) ?? null;
  const referrer = request.headers.get('referer')?.slice(0, 500) ?? null;

  const visitRow: SiteVisitRow = {
    first_path: normalizedPath,
    last_path: normalizedPath,
    referrer,
    user_agent: userAgent,
    visit_date: today,
    visitor_hash: visitorHash,
  };

  const { error: visitError } = await supabase.from('site_visits').insert(visitRow);

  if (isUniqueViolation(visitError)) {
    const { error: updateError } = await supabase
      .from('site_visits')
      .update({
        last_path: normalizedPath,
        last_seen_at: new Date().toISOString(),
      })
      .eq('visit_date', today)
      .eq('visitor_hash', visitorHash);

    if (updateError) {
      throw new Error(updateError.message);
    }
  } else if (visitError) {
    throw new Error(visitError.message);
  }

  if (!eventType || !postId) {
    return;
  }

  const contentEventRow: ContentEventRow = {
    event_date: today,
    event_type: eventType,
    path: normalizedPath,
    post_id: postId,
    provider: eventType === 'download' ? provider : '',
    visitor_hash: visitorHash,
  };
  const { error: eventError } = await supabase
    .from('content_events')
    .insert(contentEventRow);

  if (eventError && !isUniqueViolation(eventError)) {
    throw new Error(eventError.message);
  }
}

export async function getMonitoringSummary(): Promise<MonitoringSummary> {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return {
      configured: false,
      charts: {
        daily: buildEmptyDailyChart(),
        hourly: buildEmptyHourlyChart(),
      },
      downloads: { month: 0, today: 0, week: 0 },
      topContent: [],
      visits: { month: 0, today: 0, week: 0 },
    };
  }

  const today = getDateKey(new Date());
  const weekStart = getDateKey(daysAgo(6));
  const monthStart = getDateKey(daysAgo(29));

  const [
    todayVisits,
    weekVisits,
    monthVisits,
    todayDownloads,
    weekDownloads,
    monthDownloads,
  ] = await Promise.all([
    countRows('site_visits', { column: 'visit_date', from: today }),
    countRows('site_visits', { column: 'visit_date', from: weekStart }),
    countRows('site_visits', { column: 'visit_date', from: monthStart }),
    countRows('content_events', {
      column: 'event_date',
      eventType: 'download',
      from: today,
    }),
    countRows('content_events', {
      column: 'event_date',
      eventType: 'download',
      from: weekStart,
    }),
    countRows('content_events', {
      column: 'event_date',
      eventType: 'download',
      from: monthStart,
    }),
  ]);

  return {
    configured: true,
    charts: await getMonitoringCharts(),
    downloads: {
      month: monthDownloads,
      today: todayDownloads,
      week: weekDownloads,
    },
    topContent: await getTopContent(monthStart),
    visits: {
      month: monthVisits,
      today: todayVisits,
      week: weekVisits,
    },
  };
}

async function getMonitoringCharts() {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return {
      daily: buildEmptyDailyChart(),
      hourly: buildEmptyHourlyChart(),
    };
  }

  const hourlyBuckets = buildHourlyBuckets();
  const dailyBuckets = buildDailyBuckets();
  const hourlyStart = hourlyBuckets[0]?.start.toISOString() ?? new Date().toISOString();
  const dailyStart = dailyBuckets[0]?.dateKey ?? getDateKey(daysAgo(6));

  const [
    hourlyVisits,
    hourlyDownloads,
    dailyVisits,
    dailyDownloads,
  ] = await Promise.all([
    supabase.from('site_visits').select('first_seen_at').gte('first_seen_at', hourlyStart),
    supabase
      .from('content_events')
      .select('created_at')
      .eq('event_type', 'download')
      .gte('created_at', hourlyStart),
    supabase.from('site_visits').select('visit_date').gte('visit_date', dailyStart),
    supabase
      .from('content_events')
      .select('event_date')
      .eq('event_type', 'download')
      .gte('event_date', dailyStart),
  ]);

  for (const result of [hourlyVisits, hourlyDownloads, dailyVisits, dailyDownloads]) {
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  const hourlyVisitCounts = countRowsByHour(
    (hourlyVisits.data ?? []) as MonitoringTimestampRow[],
    'first_seen_at',
  );
  const hourlyDownloadCounts = countRowsByHour(
    (hourlyDownloads.data ?? []) as MonitoringTimestampRow[],
    'created_at',
  );
  const dailyVisitCounts = countRowsByDate(
    (dailyVisits.data ?? []) as MonitoringTimestampRow[],
    'visit_date',
  );
  const dailyDownloadCounts = countRowsByDate(
    (dailyDownloads.data ?? []) as MonitoringTimestampRow[],
    'event_date',
  );

  return {
    daily: dailyBuckets.map((bucket) => ({
      downloads: dailyDownloadCounts.get(bucket.dateKey) ?? 0,
      label: bucket.label,
      visits: dailyVisitCounts.get(bucket.dateKey) ?? 0,
    })),
    hourly: hourlyBuckets.map((bucket) => ({
      downloads: hourlyDownloadCounts.get(bucket.hourKey) ?? 0,
      label: bucket.label,
      visits: hourlyVisitCounts.get(bucket.hourKey) ?? 0,
    })),
  };
}

async function countRows(
  table: 'content_events' | 'site_visits',
  {
    column,
    eventType,
    from,
  }: {
    column: 'event_date' | 'visit_date';
    eventType?: AnalyticsEventType;
    from: string;
  },
) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return 0;
  }

  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  query = query.gte(column, from);

  if (eventType) {
    query = query.eq('event_type', eventType);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

async function getTopContent(from: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return [];
  }

  const { data: eventData, error: eventError } = await supabase
    .from('content_events')
    .select('post_id, event_type, provider')
    .gte('event_date', from);

  if (eventError) {
    throw new Error(eventError.message);
  }

  const events = (eventData ?? []) as MonitoringEventRow[];
  const postIds = [...new Set(events.map((event) => event.post_id))];

  if (postIds.length === 0) {
    return [];
  }

  const { data: postData, error: postError } = await supabase
    .from('posts')
    .select('id, slug, title, cosplayer, character, source, category')
    .in('id', postIds);

  if (postError) {
    throw new Error(postError.message);
  }

  const postsById = new Map(
    ((postData ?? []) as MonitoringPostRow[]).map((post) => [post.id, post]),
  );
  const metrics = new Map<string, { downloads: number; views: number }>();

  for (const event of events) {
    const current = metrics.get(event.post_id) ?? { downloads: 0, views: 0 };

    if (event.event_type === 'download') {
      current.downloads += 1;
    } else {
      current.views += 1;
    }

    metrics.set(event.post_id, current);
  }

  return [...metrics.entries()]
    .map(([postId, metric]) => {
      const post = postsById.get(postId);

      if (!post) {
        return null;
      }

      return {
        ...post,
        downloads: metric.downloads,
        score: metric.views + metric.downloads,
        views: metric.views,
      };
    })
    .filter((item): item is MonitoringContentItem => item !== null)
    .sort((left, right) => right.score - left.score || right.downloads - left.downloads)
    .slice(0, 10);
}

function getVisitorHash(request: Request, visitorId?: string) {
  const visitor = visitorId?.trim();
  const userAgent = request.headers.get('user-agent') ?? '';
  const ipAddress = getClientIp(request);
  const salt =
    process.env.ANALYTICS_SALT ||
    process.env.ADMIN_SESSION_SECRET ||
    analyticsSaltFallback;
  const identity = visitor
    ? `visitor|${visitor}|${userAgent}|${salt}`
    : `network|${ipAddress}|${userAgent}|${salt}`;

  return createHash('sha256').update(identity).digest('hex');
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function normalizePath(path: string) {
  const fallback = '/';

  if (!path.trim()) {
    return fallback;
  }

  try {
    return new URL(path, 'https://tunacosplay.local').pathname.slice(0, 300) || fallback;
  } catch {
    return path.startsWith('/') ? path.slice(0, 300) : fallback;
  }
}

function shouldIgnorePath(path: string) {
  return ignoredPathPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildEmptyHourlyChart() {
  return buildHourlyBuckets().map((bucket) => ({
    downloads: 0,
    label: bucket.label,
    visits: 0,
  }));
}

function buildEmptyDailyChart() {
  return buildDailyBuckets().map((bucket) => ({
    downloads: 0,
    label: bucket.label,
    visits: 0,
  }));
}

function buildHourlyBuckets() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(now.getHours() - 23, 0, 0, 0);

  return Array.from({ length: 24 }, (_, index) => {
    const bucketStart = new Date(start);
    bucketStart.setHours(start.getHours() + index);

    return {
      hourKey: getHourKey(bucketStart),
      label: new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        hour12: false,
        minute: '2-digit',
      }).format(bucketStart),
      start: bucketStart,
    };
  });
}

function buildDailyBuckets() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = daysAgo(6 - index);
    const dateKey = getDateKey(date);

    return {
      dateKey,
      label: `${date.getMonth() + 1}/${date.getDate()}`,
    };
  });
}

function countRowsByHour(
  rows: MonitoringTimestampRow[],
  field: 'created_at' | 'first_seen_at',
) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const value = row[field];

    if (!value) {
      continue;
    }

    const hourKey = getHourKey(new Date(value));
    counts.set(hourKey, (counts.get(hourKey) ?? 0) + 1);
  }

  return counts;
}

function countRowsByDate(
  rows: MonitoringTimestampRow[],
  field: 'event_date' | 'visit_date',
) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const value = row[field];

    if (!value) {
      continue;
    }

    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return counts;
}

function getHourKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
    String(date.getHours()).padStart(2, '0'),
  ].join('-');
}

function daysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

function isUniqueViolation(error: { code?: string } | null) {
  return error?.code === '23505';
}
