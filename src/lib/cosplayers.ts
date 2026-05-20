import type { Post } from '@/types';

export interface CosplayerRanking {
  name: string;
  slug: string;
  postCount: number;
  photoCount: number;
  videoCount: number;
  totalViews: number;
}

export function getCosplayerSlug(name: string) {
  const asciiSlug = slugifyCosplayerName(name);
  return asciiSlug || encodeURIComponent(name.trim().toLowerCase());
}

export function getCosplayerRankings(posts: Post[]) {
  const rankings = new Map<string, CosplayerRanking>();

  posts.forEach((post) => {
    const key = getCosplayerMatchKey(post.cosplayer);

    if (!key) {
      return;
    }

    const existing = rankings.get(key);

    if (existing) {
      existing.postCount += 1;
      existing.photoCount += post.photoCount;
      existing.videoCount += post.videoCount;
      existing.totalViews += post.totalViews;
      return;
    }

    rankings.set(key, {
      name: post.cosplayer,
      slug: getCosplayerSlug(post.cosplayer),
      postCount: 1,
      photoCount: post.photoCount,
      videoCount: post.videoCount,
      totalViews: post.totalViews,
    });
  });

  return Array.from(rankings.values()).sort(
    (a, b) =>
      b.totalViews - a.totalViews ||
      b.postCount - a.postCount ||
      a.name.localeCompare(b.name),
  );
}

export function filterPostsByCosplayer(posts: Post[], cosplayerSlug: string) {
  const matchKey = getCosplayerMatchKey(cosplayerSlug);

  return posts.filter(
    (post) => getCosplayerMatchKey(post.cosplayer) === matchKey,
  );
}

export function getCosplayerName(posts: Post[], cosplayerSlug: string) {
  const matchKey = getCosplayerMatchKey(cosplayerSlug);
  return (
    posts.find((post) => getCosplayerMatchKey(post.cosplayer) === matchKey)
      ?.cosplayer ?? safeDecodeURIComponent(cosplayerSlug).replace(/-/g, ' ')
  );
}

function getCosplayerMatchKey(value: string) {
  const decodedValue = safeDecodeURIComponent(value).trim().toLowerCase();
  return slugifyCosplayerName(decodedValue) || decodedValue;
}

function slugifyCosplayerName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
