'use client';

import { Post } from '@/types';
import { PostGrid } from '@/components/PostGrid';
import { SectionTitle } from './SectionTitle';

interface ExploreSectionProps {
  title: string;
  posts: Post[];
}

export function ExploreSection({ title, posts }: ExploreSectionProps) {
  return (
    <section className="mb-12">
      <SectionTitle title={title} />
      <PostGrid className="gap-6 lg:grid-cols-3 xl:grid-cols-4" posts={posts} />
    </section>
  );
}
