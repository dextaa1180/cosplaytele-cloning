import { RankingPageLayout } from '@/components/ranking/RankingPageLayout';
import { getPublishedPosts } from '@/lib/published-posts';

export const dynamic = 'force-dynamic';

export default async function Top7DayPage() {
  const posts = await getPublishedPosts();

  return (
    <RankingPageLayout
      title="Top 7 Days"
      description="Most popular cosplay in the last 7 days"
      period="7d"
      posts={posts}
    />
  );
}
