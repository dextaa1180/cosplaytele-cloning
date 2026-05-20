import Link from 'next/link';
import type { CosplayerRanking } from '@/lib/cosplayers';

interface BestCosplayerLayoutProps {
  cosplayers: CosplayerRanking[];
}

export function BestCosplayerLayout({ cosplayers }: BestCosplayerLayoutProps) {
  return (
    <div className="w-full bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Best Cosplayers
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Top cosplayers from published content
          </p>
        </div>

        {cosplayers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cosplayers.map((cosplayer, index) => (
              <Link
                key={cosplayer.slug}
                href={`/cosplayer/${cosplayer.slug}`}
                className="group flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 transition-all hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-lg font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-semibold text-slate-900 group-hover:text-slate-700 dark:text-white dark:group-hover:text-slate-200">
                    {cosplayer.name}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {cosplayer.postCount} collection
                    {cosplayer.postCount === 1 ? '' : 's'} /{' '}
                    {cosplayer.photoCount} photos / {cosplayer.videoCount}{' '}
                    videos
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            No published cosplayers found.
          </div>
        )}
      </div>
    </div>
  );
}
