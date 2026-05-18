'use client';

import { DetailPostLayout } from '@/components/detail/DetailPostLayout';
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
    <DetailPostLayout
      cosplayer={post.cosplayer}
      cosplayerSlug="tiny-asababy"
      character={post.character}
      source={post.source}
      photoCount={post.photoCount}
      videoCount={post.videoCount}
      thumbnail={post.thumbnail}
    />
  );
}
