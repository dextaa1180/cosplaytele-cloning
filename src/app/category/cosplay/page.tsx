import { CategoryPageLayout } from '@/components/category/CategoryPageLayout';
import { getPublishedPosts } from '@/lib/published-posts';

export const dynamic = 'force-dynamic';

export default async function CosplayPage() {
  const posts = await getPublishedPosts();

  return (
    <CategoryPageLayout
      title="Cosplay"
      description="Explore amazing cosplay collections"
      category="cosplay"
      posts={posts}
    />
  );
}
