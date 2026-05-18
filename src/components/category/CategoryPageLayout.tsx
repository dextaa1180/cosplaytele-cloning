'use client';

import { posts } from '@/data/posts';
import { PostGrid } from '@/components/PostGrid';
import { filterPostsByCategory } from '@/lib/posts';

interface CategoryPageLayoutProps {
  title: string;
  description?: string;
  category: string;
}

export function CategoryPageLayout({
  title,
  description,
  category,
}: CategoryPageLayoutProps) {
  const filteredPosts = filterPostsByCategory(posts, category);

  return (
    <div className="w-full bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>

        <PostGrid posts={filteredPosts} />
      </div>
    </div>
  );
}
