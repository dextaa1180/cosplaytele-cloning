import { RankingPageLayout } from '@/components/ranking/RankingPageLayout';
import { getPublishedPosts } from '@/lib/published-posts';

export const dynamic = 'force-dynamic';

export default async function Top24HoursPage() {
  const posts = await getPublishedPosts();

  return (
    <RankingPageLayout
      title="Top 24 Hours"
      description="Most popular cosplay in the last 24 hours"
      period="24h"
      posts={posts}
    />
  );
}
