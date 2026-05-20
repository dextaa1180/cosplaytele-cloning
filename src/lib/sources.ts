import type { Post } from '@/types';
import { safeDecodeURIComponent, slugifyText } from '@/lib/slug';

export function getSourceSlug(name: string) {
  const asciiSlug = slugifySourceName(name);
  return asciiSlug || encodeURIComponent(name.trim().toLowerCase());
}

export function filterPostsBySource(posts: Post[], sourceSlug: string) {
  const matchKey = getSourceMatchKey(sourceSlug);

  return posts.filter((post) => getSourceMatchKey(post.source) === matchKey);
}

export function getSourceName(posts: Post[], sourceSlug: string) {
  const matchKey = getSourceMatchKey(sourceSlug);
  return (
    posts.find((post) => getSourceMatchKey(post.source) === matchKey)?.source ??
    safeDecodeURIComponent(sourceSlug).replace(/-/g, ' ')
  );
}

function getSourceMatchKey(value: string) {
  const decodedValue = safeDecodeURIComponent(value).trim().toLowerCase();
  return slugifySourceName(decodedValue) || decodedValue;
}

function slugifySourceName(name: string) {
  return slugifyText(name);
}
