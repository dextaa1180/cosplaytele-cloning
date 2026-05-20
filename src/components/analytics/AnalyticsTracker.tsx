'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

type AnalyticsEvent = 'download' | 'page' | 'view';
type DownloadProvider = 'gofile' | 'mediafire' | 'telegram' | 'terabox';

interface AnalyticsPayload {
  event: AnalyticsEvent;
  path?: string;
  postId?: string;
  provider?: DownloadProvider;
}

const visitorStorageKey = 'tunacosplay-visitor-id';

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    sendAnalyticsEvent({
      event: 'page',
      path: pathname,
    });
  }, [pathname]);

  return null;
}

export function ContentAnalyticsTracker({ postId }: { postId: string }) {
  const pathname = usePathname();

  useEffect(() => {
    sendAnalyticsEvent({
      event: 'view',
      path: pathname,
      postId,
    });
  }, [pathname, postId]);

  return null;
}

export function sendAnalyticsEvent(payload: AnalyticsPayload) {
  if (typeof window === 'undefined') {
    return;
  }

  const visitorId = getOrCreateVisitorId();
  const body = JSON.stringify({
    ...payload,
    path: payload.path || window.location.pathname,
    visitorId,
  });

  void fetch('/api/analytics', {
    body,
    headers: {
      'Content-Type': 'application/json',
    },
    keepalive: true,
    method: 'POST',
  }).catch(() => undefined);
}

function getOrCreateVisitorId() {
  try {
    const existingVisitorId = window.localStorage.getItem(visitorStorageKey);

    if (existingVisitorId) {
      return existingVisitorId;
    }

    const visitorId =
      window.crypto.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(visitorStorageKey, visitorId);
    return visitorId;
  } catch {
    return 'storage-unavailable';
  }
}
