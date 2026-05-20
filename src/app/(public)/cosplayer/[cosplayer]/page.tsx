import { PostGrid } from '@/components/PostGrid';
import {
  filterPostsByCosplayer,
  getCosplayerName,
} from '@/lib/cosplayers';
import { getPublishedPosts } from '@/lib/published-posts';

interface CosplayerPageProps {
  params: Promise<{
    cosplayer: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function CosplayerPage({ params }: CosplayerPageProps) {
  const { cosplayer } = await params;
  const posts = await getPublishedPosts();
  const filteredPosts = filterPostsByCosplayer(posts, cosplayer);
  const cosplayerName = getCosplayerName(posts, cosplayer);

  return (
    <div className="w-full bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            Cosplayer Collection
          </p>
          <h1 className="mt-2 text-3xl font-bold capitalize text-slate-900 dark:text-white">
            {cosplayerName}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {filteredPosts.length} published collection
            {filteredPosts.length === 1 ? '' : 's'}
          </p>
        </div>

        {filteredPosts.length > 0 ? (
          <PostGrid posts={filteredPosts} />
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            No content found for this cosplayer.
          </div>
        )}
      </div>
    </div>
  );
}
