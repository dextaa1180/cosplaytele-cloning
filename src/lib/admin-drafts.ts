import { Category, Tag } from '@/types';

export interface AdminDraftMedia {
  id: string;
  type: 'image' | 'video';
  fileName: string;
  fileSize: number;
  alt: string;
  duration?: string;
  sortOrder: number;
  storageStatus: 'local-only';
}

export interface AdminPostDraft {
  id: string;
  title: string;
  slug: string;
  cosplayer: string;
  character: string;
  source: string;
  category: Category;
  tags: Tag[];
  photoCount: number;
  videoCount: number;
  fileSize: string;
  unzipPassword: string;
  description: string;
  downloadLinks: {
    mediafire: string;
    telegram: string;
    sorafolder: string;
    gofile: string;
  };
  previewMedia: AdminDraftMedia[];
  status: 'draft';
  createdAt: string;
  updatedAt: string;
}

export const ADMIN_DRAFTS_STORAGE_KEY = 'tunacosplay-admin-post-drafts';
const ADMIN_DRAFTS_CHANGE_EVENT = 'tunacosplay-admin-post-drafts-change';

export function slugifyTitle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function readAdminDrafts() {
  return parseAdminDraftsSnapshot(readAdminDraftsSnapshot());
}

export function readAdminDraftsSnapshot() {
  if (typeof window === 'undefined') {
    return '[]';
  }

  try {
    const localDrafts = window.localStorage.getItem(ADMIN_DRAFTS_STORAGE_KEY);
    if (localDrafts) {
      return localDrafts;
    }
  } catch {
    // Fall through to cookie fallback.
  }

  return readDraftCookie();
}

export function parseAdminDraftsSnapshot(snapshot: string) {
  try {
    const parsed: unknown = JSON.parse(snapshot);
    return Array.isArray(parsed) ? (parsed as AdminPostDraft[]) : [];
  } catch {
    return [];
  }
}

export function writeAdminDrafts(drafts: AdminPostDraft[]) {
  const serialized = JSON.stringify(drafts);

  try {
    window.localStorage.setItem(ADMIN_DRAFTS_STORAGE_KEY, serialized);
  } catch {
    // Cookie fallback below still keeps draft metadata available.
  }

  document.cookie = `${ADMIN_DRAFTS_STORAGE_KEY}=${encodeURIComponent(serialized)}; path=/; max-age=604800; SameSite=Lax`;
  window.dispatchEvent(new Event(ADMIN_DRAFTS_CHANGE_EVENT));
}

export function subscribeAdminDrafts(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(ADMIN_DRAFTS_CHANGE_EVENT, callback);
  queueMicrotask(callback);

  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(ADMIN_DRAFTS_CHANGE_EVENT, callback);
  };
}

export function upsertAdminDraft(draft: AdminPostDraft) {
  const drafts = readAdminDrafts();
  const index = drafts.findIndex((item) => item.id === draft.id);

  if (index >= 0) {
    drafts[index] = draft;
  } else {
    drafts.unshift(draft);
  }

  writeAdminDrafts(drafts);
  return drafts;
}

export function deleteAdminDraft(id: string) {
  const drafts = readAdminDrafts().filter((draft) => draft.id !== id);
  writeAdminDrafts(drafts);
  return drafts;
}

export async function fetchAdminDrafts() {
  const response = await fetch('/api/admin/drafts', { cache: 'no-store' });
  if (!response.ok) {
    return readAdminDrafts();
  }

  const payload = (await response.json()) as { drafts?: unknown };
  return Array.isArray(payload.drafts)
    ? (payload.drafts as AdminPostDraft[])
    : [];
}

export async function saveAdminDraft(draft: AdminPostDraft) {
  const response = await fetch('/api/admin/drafts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(draft),
  });

  if (!response.ok) {
    return upsertAdminDraft(draft);
  }

  const payload = (await response.json()) as { drafts?: unknown };
  const drafts = Array.isArray(payload.drafts)
    ? (payload.drafts as AdminPostDraft[])
    : [];
  writeAdminDrafts(drafts);
  return drafts;
}

export async function removeAdminDraft(id: string) {
  const response = await fetch(`/api/admin/drafts?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    return deleteAdminDraft(id);
  }

  const payload = (await response.json()) as { drafts?: unknown };
  const drafts = Array.isArray(payload.drafts)
    ? (payload.drafts as AdminPostDraft[])
    : [];
  writeAdminDrafts(drafts);
  return drafts;
}

function readDraftCookie() {
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${ADMIN_DRAFTS_STORAGE_KEY}=`));

  if (!cookie) {
    return '[]';
  }

  return decodeURIComponent(cookie.slice(ADMIN_DRAFTS_STORAGE_KEY.length + 1));
}
