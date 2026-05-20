import type { Post } from '@/types';

export function getCosplayerSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function filterPostsByCosplayer(posts: Post[], cosplayerSlug: string) {
  return posts.filter(
    (post) => getCosplayerSlug(post.cosplayer) === cosplayerSlug,
  );
}

export function getCosplayerName(posts: Post[], cosplayerSlug: string) {
  return (
    posts.find((post) => getCosplayerSlug(post.cosplayer) === cosplayerSlug)
      ?.cosplayer ?? cosplayerSlug.replace(/-/g, ' ')
  );
}
