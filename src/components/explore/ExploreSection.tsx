'use client';

import { Post } from '@/types';
import { PostCard } from '@/components/PostCard';
import { SectionTitle } from './SectionTitle';

interface ExploreSectionProps {
  title: string;
  posts: Post[];
}

export function ExploreSection({ title, posts }: ExploreSectionProps) {
  return (
    <section className="mb-12">
      <SectionTitle title={title} />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
