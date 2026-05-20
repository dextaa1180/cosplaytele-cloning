import type { Post } from '@/types';

export function searchPosts(posts: Post[], query: string, limit?: number) {
  const terms = normalizeSearchText(query)
    .split(' ')
    .filter(Boolean);

  if (terms.length === 0) {
    return [];
  }

  const scoredPosts = posts
    .map((post) => ({
      post,
      score: scorePost(post, terms),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.post.totalViews - a.post.totalViews)
    .map((item) => item.post);

  return typeof limit === 'number' ? scoredPosts.slice(0, limit) : scoredPosts;
}

function scorePost(post: Post, terms: string[]) {
  const title = normalizeSearchText(post.title);
  const cosplayer = normalizeSearchText(post.cosplayer);
  const character = normalizeSearchText(post.character);
  const source = normalizeSearchText(post.source);
  const category = normalizeSearchText(post.category);
  const tags = normalizeSearchText(post.tags.join(' '));
  const description = normalizeSearchText(post.description ?? '');
  const haystack = [
    title,
    cosplayer,
    character,
    source,
    category,
    tags,
    description,
  ].join(' ');

  return terms.reduce((score, term) => {
    if (!haystack.includes(term)) {
      return score;
    }

    if (title.includes(term)) return score + 12;
    if (cosplayer.includes(term)) return score + 10;
    if (character.includes(term)) return score + 8;
    if (source.includes(term)) return score + 6;
    if (category.includes(term) || tags.includes(term)) return score + 4;
    return score + 1;
  }, 0);
}

function normalizeSearchText(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/\p{Diacritic}/gu, ' ');
}
