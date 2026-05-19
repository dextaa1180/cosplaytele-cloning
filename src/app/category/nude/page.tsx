import { CategoryPageLayout } from '@/components/category/CategoryPageLayout';
import { getPublishedPosts } from '@/lib/published-posts';

export const dynamic = 'force-dynamic';

export default async function NudePage() {
  const posts = await getPublishedPosts();

  return (
    <CategoryPageLayout
      title="Nude"
      description="Explore nude collections (safe placeholder)"
      category="nude"
      posts={posts}
    />
  );
}
