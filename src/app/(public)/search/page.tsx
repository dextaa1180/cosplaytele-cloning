import { PostGrid } from '@/components/PostGrid';
import { getPublishedPosts } from '@/lib/published-posts';
import { searchPosts } from '@/lib/search';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;
  const query = q.trim();
  const posts = query ? searchPosts(await getPublishedPosts(), query) : [];

  return (
    <div className="w-full bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Search
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {query
              ? `${posts.length} result${posts.length === 1 ? '' : 's'} for "${query}"`
              : 'Type a keyword in the search box.'}
          </p>
        </div>

        {posts.length > 0 ? (
          <PostGrid posts={posts} />
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            No content found.
          </div>
        )}
      </div>
    </div>
  );
}
