import { ExploreSection } from '@/components/explore/ExploreSection';
import { TopViewSection } from '@/components/explore/TopViewSection';
import { getPublishedPosts } from '@/lib/published-posts';
import {
  filterPostsByTag,
  sortPostsByViews24h,
  sortPostsByViews3d,
  sortPostsByViews7d,
  getTopPosts,
} from '@/lib/posts';

export const dynamic = 'force-dynamic';

export default async function ExploreCategoriesPage() {
  const posts = await getPublishedPosts();

  // Filter posts by tags
  const cosplayGamePosts = filterPostsByTag(posts, 'cosplay-game');
  const cosplayAnimeMangaPosts = filterPostsByTag(posts, 'cosplay-anime-manga');
  const cosplayFreestylePosts = filterPostsByTag(posts, 'cosplay-freestyle');

  // Sort posts by views for TOP VIEW section
  const top24hPosts = getTopPosts(sortPostsByViews24h(posts), 6);
  const top3dPosts = getTopPosts(sortPostsByViews3d(posts), 6);
  const top7dPosts = getTopPosts(sortPostsByViews7d(posts), 6);

  return (
    <div className="w-full bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Explore Categories
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Browse cosplay collections by category and popularity
          </p>
        </div>

        {/* COSPLAY GAME Section */}
        <ExploreSection title="COSPLAY GAME" posts={cosplayGamePosts} />

        {/* COSPLAY ANIME/MANGA Section */}
        <ExploreSection
          title="COSPLAY ANIME/MANGA"
          posts={cosplayAnimeMangaPosts}
        />

        {/* COSPLAY FREESTYLE Section */}
        <ExploreSection title="COSPLAY FREESTYLE" posts={cosplayFreestylePosts} />

        {/* TOP VIEW Section with Tabs */}
        <TopViewSection
          posts24h={top24hPosts}
          posts3d={top3dPosts}
          posts7d={top7dPosts}
        />
      </div>
    </div>
  );
}
