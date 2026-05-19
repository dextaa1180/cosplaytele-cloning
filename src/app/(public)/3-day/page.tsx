import { RankingPageLayout } from '@/components/ranking/RankingPageLayout';
import { getPublishedPosts } from '@/lib/published-posts';

export const dynamic = 'force-dynamic';

export default async function Top3DayPage() {
  const posts = await getPublishedPosts();

  return (
    <RankingPageLayout
      title="Top 3 Days"
      description="Most popular cosplay in the last 3 days"
      period="3d"
      posts={posts}
    />
  );
}
