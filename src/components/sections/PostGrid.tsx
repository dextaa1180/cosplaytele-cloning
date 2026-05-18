'use client';

import { posts } from '@/features/posts/data';
import { PostCard } from '@/components/sections/PostCard';

export function PostGrid() {
  return (
    <section className="w-full bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Cosplay Gallery
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Explore amazing cosplay collections
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
