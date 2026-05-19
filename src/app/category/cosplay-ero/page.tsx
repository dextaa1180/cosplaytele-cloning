import { CategoryPageLayout } from '@/components/category/CategoryPageLayout';
import { getPublishedPosts } from '@/lib/published-posts';

export const dynamic = 'force-dynamic';

export default async function CosplayEroPage() {
  const posts = await getPublishedPosts();

  return (
    <CategoryPageLayout
      title="Cosplay Ero"
      description="Explore cosplay ero collections (safe placeholder)"
      category="cosplay-ero"
      posts={posts}
    />
  );
}
