'use client';

import { PostGrid } from '@/components/PostGrid';

interface RankingPageLayoutProps {
  title: string;
  description: string;
  period: '24h' | '3d' | '7d';
}

export function RankingPageLayout({
  title,
  description,
}: RankingPageLayoutProps) {
  return (
    <div className="w-full bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>

        <PostGrid />
      </div>
    </div>
  );
}
