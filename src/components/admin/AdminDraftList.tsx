'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FilePenLine, ImageIcon, Trash2, Video } from 'lucide-react';
import { ADMIN_DASHBOARD_PATH } from '@/lib/admin-auth';
import {
  AdminPostDraft,
  fetchAdminDrafts,
  removeAdminDraft,
} from '@/lib/admin-drafts';

export function AdminDraftList() {
  const [drafts, setDrafts] = useState<AdminPostDraft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void fetchAdminDrafts()
      .then((nextDrafts) => {
        if (active) {
          setDrafts(nextDrafts);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const totals = useMemo(
    () => ({
      images: drafts.reduce(
        (sum, draft) =>
          sum + draft.previewMedia.filter((media) => media.type === 'image').length,
        0,
      ),
      videos: drafts.reduce(
        (sum, draft) =>
          sum + draft.previewMedia.filter((media) => media.type === 'video').length,
        0,
      ),
    }),
    [drafts],
  );

  const handleDelete = async (id: string) => {
    setDrafts(await removeAdminDraft(id));
  };

  return (
    <section className="mt-8 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-950 dark:text-white">
            Drafts
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {drafts.length} drafts / {totals.images} images / {totals.videos} videos
          </p>
        </div>
        <Link
          href={`${ADMIN_DASHBOARD_PATH}/posts/new`}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          <FilePenLine className="h-4 w-4" aria-hidden="true" />
          Continue Drafting
        </Link>
      </div>

      {drafts.length > 0 ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {drafts.map((draft) => {
            const images = draft.previewMedia.filter(
              (media) => media.type === 'image',
            ).length;
            const videos = draft.previewMedia.filter(
              (media) => media.type === 'video',
            ).length;

            return (
              <div
                key={draft.id}
                className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1.5fr)_auto_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950 dark:text-white">
                    {draft.title || 'Untitled draft'}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                    {draft.slug || 'no-slug'} / updated {new Date(draft.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <ImageIcon className="h-4 w-4" aria-hidden="true" />
                    {images}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Video className="h-4 w-4" aria-hidden="true" />
                    {videos}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDelete(draft.id)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          {loading ? 'Loading drafts...' : 'No drafts yet.'}
        </div>
      )}
    </section>
  );
}
