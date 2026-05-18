'use client';

import { posts } from '@/data/posts';
import { PostGrid } from '@/components/PostGrid';
import { filterPostsByCategory, filterPostsWithVideo } from '@/lib/posts';

interface CategoryPageLayoutProps {
  title: string;
  description?: string;
  category: string;
  filterMode?: 'category' | 'video';
}

export function CategoryPageLayout({
  title,
  description,
  category,
  filterMode = 'category',
}: CategoryPageLayoutProps) {
  const filteredPosts =
    filterMode === 'video'
      ? filterPostsWithVideo(posts)
      : filterPostsByCategory(posts, category);

  return (
    <div className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#170C79]">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-[#56B6C6]">
              {description}
            </p>
          )}
        </div>

        <PostGrid posts={filteredPosts} />
      </div>
    </div>
  );
}
