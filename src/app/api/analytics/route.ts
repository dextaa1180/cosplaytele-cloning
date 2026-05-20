import { trackAnalyticsEvent } from '@/lib/analytics';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type AnalyticsEvent = 'download' | 'page' | 'view';
type DownloadProvider = 'gofile' | 'mediafire' | 'telegram' | 'terabox';

interface AnalyticsPayload {
  event?: AnalyticsEvent;
  path?: string;
  postId?: string;
  provider?: DownloadProvider;
  visitorId?: string;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as AnalyticsPayload;
    const eventType = payload.event === 'download' ? 'download' : payload.event === 'view' ? 'view' : undefined;

    await trackAnalyticsEvent({
      eventType,
      path: payload.path || '/',
      postId: payload.postId,
      provider: eventType === 'download' ? payload.provider : '',
      request,
      visitorId: payload.visitorId,
    });
  } catch {
    return Response.json({ ok: true });
  }

  return Response.json({ ok: true });
}
