import { Post, Tag } from '@/types';

export function filterPostsByTag(posts: Post[], tag: Tag): Post[] {
  return posts.filter((post) => post.tags.includes(tag));
}

export function filterPostsByCategory(posts: Post[], category: string): Post[] {
  return posts.filter((post) => post.category === category);
}

export function filterPostsWithVideo(posts: Post[]): Post[] {
  return posts.filter((post) => post.videoCount > 0);
}

export function sortPostsByViews24h(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.views24h - a.views24h);
}

export function sortPostsByViews3d(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.views3d - a.views3d);
}

export function sortPostsByViews7d(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.views7d - a.views7d);
}

export function getTopPosts(posts: Post[], limit: number = 6): Post[] {
  return posts.slice(0, limit);
}
