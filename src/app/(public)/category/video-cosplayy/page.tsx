import { CategoryPageLayout } from '@/components/category/CategoryPageLayout';
import { getPublishedPosts } from '@/lib/published-posts';

export const dynamic = 'force-dynamic';

export default async function VideoCosplayPage() {
  const posts = await getPublishedPosts();

  return (
    <CategoryPageLayout
      title="Video Cosplay"
      description="Explore amazing video cosplay collections"
      category="video-cosplayy"
      filterMode="video"
      posts={posts}
    />
  );
}
