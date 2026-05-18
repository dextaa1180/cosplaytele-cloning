'use client';

import Image from 'next/image';
import { posts } from '@/data/posts';

interface DetailPageProps {
  params: {
    slug: string;
  };
}

export default function DetailPage({ params }: DetailPageProps) {
  const post = posts.find((p) => p.slug === params.slug);

  if (!post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Post not found
        </h1>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {post.cosplayer}
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            {post.character}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
            {post.source}
          </p>
        </div>

        {/* Image */}
        <div className="relative mb-8 aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
          <Image
            src={post.thumbnail}
            alt={`${post.cosplayer} as ${post.character}`}
            fill
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Photos
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {post.photoCount}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Videos
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {post.videoCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
