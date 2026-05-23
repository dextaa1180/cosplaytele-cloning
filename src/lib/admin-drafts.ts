import { ADMIN_API_BASE_PATH } from '@/lib/admin-auth';
import { slugifyText } from '@/lib/slug';
import { Category, Tag } from '@/types';

export interface AdminDraftMedia {
  id: string;
  type: 'image' | 'video';
  fileName: string;
  fileSize: number;
  url?: string;
  posterUrl?: string;
  alt: string;
  width?: number;
  height?: number;
  duration?: string;
  sortOrder: number;
  storageStatus: 'local-only' | 'uploaded';
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
  thumbnailUrl?: string;
  heroImageUrl?: string;
  fileSize: string;
  unzipPassword: string;
  description: string;
  downloadLinks: {
    mediafire: string;
    telegram: string;
    terabox: string;
    gofile: string;
  };
  previewMedia: AdminDraftMedia[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

interface AdminMediaUploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export const ADMIN_DRAFTS_STORAGE_KEY = 'tunacosplay-admin-post-drafts';
const ADMIN_DRAFTS_CHANGE_EVENT = 'tunacosplay-admin-post-drafts-change';

export function slugifyTitle(value: string) {
  return slugifyText(value);
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
  const response = await fetch(`${ADMIN_API_BASE_PATH}/drafts`, { cache: 'no-store' });
  if (!response.ok) {
    return readAdminDrafts();
  }

  const payload = (await response.json()) as { drafts?: unknown };
  return Array.isArray(payload.drafts)
    ? (payload.drafts as AdminPostDraft[])
    : [];
}

export async function saveAdminDraft(draft: AdminPostDraft) {
  const response = await fetch(`${ADMIN_API_BASE_PATH}/drafts`, {
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

export async function uploadAdminMedia(
  file: File,
  options: {
    draftId: string;
    kind: 'thumbnail' | 'hero' | 'preview';
    onUploadProgress?: (progress: AdminMediaUploadProgress) => void;
    slug: string;
  },
) {
  return new Promise<{
    fileCode?: string;
    path: string;
    posterUrl?: string;
    source: 'doodstream' | 'local' | 'supabase';
    url: string;
  }>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', `${ADMIN_API_BASE_PATH}/media`);
    request.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    request.setRequestHeader('X-Tunacosplay-Upload', 'raw');
    request.setRequestHeader('X-Draft-Id', encodeURIComponent(options.draftId));
    request.setRequestHeader('X-File-Name', encodeURIComponent(file.name || 'upload'));
    request.setRequestHeader('X-File-Size', String(file.size));
    request.setRequestHeader('X-Kind', options.kind);
    request.setRequestHeader('X-Slug', encodeURIComponent(options.slug));

    request.upload.onprogress = (event) => {
      if (!options.onUploadProgress) {
        return;
      }

      const total = event.lengthComputable && event.total > 0 ? event.total : file.size;
      const loaded = Math.min(event.loaded, total);
      const percent = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
      options.onUploadProgress({ loaded, percent, total });
    };

    request.onerror = () => {
      reject(new Error('Upload connection failed before the server responded.'));
    };
    request.onabort = () => {
      reject(new Error('Upload was cancelled before it finished.'));
    };
    request.ontimeout = () => {
      reject(new Error('Upload timed out before it finished.'));
    };
    request.onload = () => {
      const payload = parseUploadResponse(request.responseText);

      if (request.status < 200 || request.status >= 300 || !payload?.url) {
        reject(
          new Error(
            payload?.error ??
              `Unable to upload media. Server returned ${request.status}.`,
          ),
        );
        return;
      }

      resolve({
        fileCode: payload.fileCode,
        path: payload.path ?? '',
        posterUrl: payload.posterUrl,
        source: payload.source ?? 'local',
        url: payload.url,
      });
    };

    request.send(file);
  });
}

function parseUploadResponse(responseText: string) {
  try {
    return JSON.parse(responseText) as {
      error?: string;
      fileCode?: string;
      path?: string;
      posterUrl?: string;
      source?: 'doodstream' | 'local' | 'supabase';
      url?: string;
    };
  } catch {
    return responseText.trim()
      ? { error: responseText.trim().slice(0, 240) }
      : null;
  }
}

export async function publishAdminPost(draft: AdminPostDraft) {
  const response = await fetch(`${ADMIN_API_BASE_PATH}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(draft),
  });

  const responseText = await response.text();
  const payload = parseJsonResponse<{ error?: string; posts?: unknown }>(
    responseText,
  );

  if (!response.ok) {
    throw new Error(
      payload?.error ??
        `Unable to publish post. Server returned ${response.status}.`,
    );
  }

  deleteAdminDraft(draft.id);
  return { posts: payload?.posts };
}

function parseJsonResponse<T>(responseText: string) {
  try {
    return JSON.parse(responseText) as T;
  } catch {
    return responseText.trim()
      ? ({ error: responseText.trim().slice(0, 240) } as T)
      : null;
  }
}

export async function removeAdminDraft(id: string) {
  const response = await fetch(`${ADMIN_API_BASE_PATH}/drafts?id=${encodeURIComponent(id)}`, {
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
