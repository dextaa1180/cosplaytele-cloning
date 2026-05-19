'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit3, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ADMIN_API_BASE_PATH, ADMIN_DASHBOARD_PATH } from '@/lib/admin-auth';

interface AdminContentActionsProps {
  id: string;
  slug: string;
  title: string;
}

export function AdminContentActions({
  id,
  slug,
  title,
}: AdminContentActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${title}"? This removes the content from the admin database.`,
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`${ADMIN_API_BASE_PATH}/posts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? 'Unable to delete content.');
      }

      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to delete content.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/${slug}`}
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
        View
      </Link>
      <Link
        href={`${ADMIN_DASHBOARD_PATH}/posts/${id}/edit`}
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
        Edit
      </Link>
      <button
        type="button"
        onClick={() => void handleDelete()}
        disabled={deleting}
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-rose-200 px-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        {deleting ? 'Deleting' : 'Delete'}
      </button>
    </div>
  );
}
