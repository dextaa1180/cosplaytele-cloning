'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/${post.slug}`}>
      <article className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-lg dark:bg-slate-900">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
          <Image
            src={post.thumbnail}
            alt={`${post.cosplayer} as ${post.character}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Badge */}
          <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs font-semibold text-white">
            📷 {post.photoCount}
            {post.videoCount > 0 && ` | 🎥 ${post.videoCount}`}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">
            {post.cosplayer}
          </h3>
          <p className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">
            {post.character}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            {post.source}
          </p>
        </div>
      </article>
    </Link>
  );
}
