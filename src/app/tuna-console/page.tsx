import Link from 'next/link';
import { ImageIcon, Plus, Video } from 'lucide-react';
import { AdminContentActions } from '@/components/admin/AdminContentActions';
import { AdminDraftList } from '@/components/admin/AdminDraftList';
import { ADMIN_DASHBOARD_PATH } from '@/lib/admin-auth';
import { getManagedPosts } from '@/lib/published-posts';

export const dynamic = 'force-dynamic';

export default async function ContentPage() {
  const posts = await getManagedPosts();
  const totalPhotos = posts.reduce((sum, post) => sum + post.photoCount, 0);
  const totalVideos = posts.reduce((sum, post) => sum + post.videoCount, 0);
  const previewMediaCount = posts.reduce(
    (sum, post) => sum + (post.previewMedia?.length ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950 dark:text-white">
            Content
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage post metadata, preview media, and external download links.
          </p>
        </div>
        <Link
          href={`${ADMIN_DASHBOARD_PATH}/posts/new`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Post
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Posts" value={posts.length.toString()} />
        <Metric label="Preview Media" value={previewMediaCount.toString()} />
        <Metric label="Full Gallery Count" value={`${totalPhotos} photos / ${totalVideos} videos`} />
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
            Content Library
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Post</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Media</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const previewImages =
                  post.previewMedia?.filter((media) => media.type === 'image').length ?? 0;
                const previewVideos =
                  post.previewMedia?.filter((media) => media.type === 'video').length ?? 0;

                return (
                  <tr
                    key={post.id}
                    className="border-b border-slate-100 last:border-b-0 dark:border-slate-800"
                  >
                    <td className="max-w-sm px-4 py-4">
                      <Link
                        href={`/${post.slug}`}
                        className="block truncate font-semibold text-slate-950 hover:text-cyan-700 dark:text-white dark:hover:text-cyan-300"
                      >
                        {post.title}
                      </Link>
                      <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                        {post.cosplayer} / {post.character}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                      {post.category}
                    </td>
                    <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <ImageIcon className="h-4 w-4" aria-hidden="true" />
                          {previewImages}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Video className="h-4 w-4" aria-hidden="true" />
                          {previewVideos}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-4 py-4">
                      <AdminContentActions
                        id={post.id}
                        slug={post.slug}
                        title={post.title}
                      />
                    </td>
                  </tr>
                );
              })}
              {posts.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No managed content yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AdminDraftList />
    </div>
  );
}

interface MetricProps {
  label: string;
  value: string;
}

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isPublished = status === 'published';

  return (
    <span className={isPublished ? publishedStatusClassName : draftStatusClassName}>
      {isPublished ? 'Published' : 'Draft'}
    </span>
  );
}

const publishedStatusClassName =
  'inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';

const draftStatusClassName =
  'inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300';
