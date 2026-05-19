import Link from 'next/link';
import { ImageIcon, Plus, Video } from 'lucide-react';
import { AdminDraftList } from '@/components/admin/AdminDraftList';
import { posts } from '@/data/posts';

export default function AdminDashboardPage() {
  const totalPhotos = posts.reduce((sum, post) => sum + post.photoCount, 0);
  const totalVideos = posts.reduce((sum, post) => sum + post.videoCount, 0);
  const previewMediaCount = posts.reduce(
    (sum, post) => sum + (post.previewMedia?.length ?? 0),
    0,
  );

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
              Admin Content
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Manage post metadata, preview media, and external download links.
            </p>
          </div>
          <Link
            href="/admin/posts/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Post
          </Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Metric label="Posts" value={posts.length.toString()} />
          <Metric label="Preview Media" value={previewMediaCount.toString()} />
          <Metric label="Full Gallery Count" value={`${totalPhotos} photos / ${totalVideos} videos`} />
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-[1.4fr_1fr_0.8fr_0.8fr] gap-4 border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span>Post</span>
            <span>Category</span>
            <span>Media</span>
            <span>Status</span>
          </div>
          {posts.map((post) => {
            const previewImages =
              post.previewMedia?.filter((media) => media.type === 'image').length ?? 0;
            const previewVideos =
              post.previewMedia?.filter((media) => media.type === 'video').length ?? 0;

            return (
              <div
                key={post.id}
                className="grid grid-cols-[1.4fr_1fr_0.8fr_0.8fr] gap-4 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0 dark:border-slate-800"
              >
                <div className="min-w-0">
                  <Link
                    href={`/${post.slug}`}
                    className="block truncate font-semibold text-slate-950 hover:text-cyan-700 dark:text-white dark:hover:text-cyan-300"
                  >
                    {post.title}
                  </Link>
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                    {post.cosplayer} / {post.character}
                  </p>
                </div>
                <span className="self-center text-slate-700 dark:text-slate-300">
                  {post.category}
                </span>
                <div className="flex items-center gap-3 self-center text-slate-700 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <ImageIcon className="h-4 w-4" aria-hidden="true" />
                    {previewImages}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Video className="h-4 w-4" aria-hidden="true" />
                    {previewVideos}
                  </span>
                </div>
                <span className="self-center">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Published
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        <AdminDraftList />
      </div>
    </div>
  );
}

interface MetricProps {
  label: string;
  value: string;
}

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}
