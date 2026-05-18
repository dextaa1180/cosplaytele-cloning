'use client';

import { posts } from '@/data/posts';
import { PostGrid } from '@/components/PostGrid';
import {
  sortPostsByViews24h,
  sortPostsByViews3d,
  sortPostsByViews7d,
  getTopPosts,
} from '@/lib/posts';

interface RankingPageLayoutProps {
  title: string;
  description: string;
  period: '24h' | '3d' | '7d';
}

export function RankingPageLayout({
  title,
  description,
  period,
}: RankingPageLayoutProps) {
  // Sort posts based on period
  let sortedPosts = posts;
  if (period === '24h') {
    sortedPosts = sortPostsByViews24h(posts);
  } else if (period === '3d') {
    sortedPosts = sortPostsByViews3d(posts);
  } else if (period === '7d') {
    sortedPosts = sortPostsByViews7d(posts);
  }

  const topPosts = getTopPosts(sortedPosts, 12);

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

        <PostGrid posts={topPosts} />
      </div>
    </div>
  );
}
