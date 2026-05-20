import { BestCosplayerLayout } from '@/components/ranking/BestCosplayerLayout';
import { getCosplayerRankings } from '@/lib/cosplayers';
import { getPublishedPosts } from '@/lib/published-posts';

export const dynamic = 'force-dynamic';

export default async function BestCosplayerPage() {
  const posts = await getPublishedPosts();
  const cosplayers = getCosplayerRankings(posts);

  return <BestCosplayerLayout cosplayers={cosplayers} />;
}
