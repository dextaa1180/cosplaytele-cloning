import { getPublishedPosts } from '@/lib/published-posts';
import { searchPosts } from '@/lib/search';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const query = searchParams.get('q') ?? '';
  const posts = await getPublishedPosts();
  const results = searchPosts(posts, query, 8).map((post) => ({
    category: post.category,
    character: post.character,
    cosplayer: post.cosplayer,
    id: post.id,
    photoCount: post.photoCount,
    slug: post.slug,
    source: post.source,
    thumbnail: post.thumbnail,
    title: post.title,
    videoCount: post.videoCount,
  }));

  return Response.json({ results });
}
