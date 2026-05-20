import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { AdminPostDraft } from '@/lib/admin-drafts';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import type { Post } from '@/types';

export type ManagedPost = Post & {
  createdAt?: string;
  status: AdminPostDraft['status'];
  updatedAt?: string;
};

type PublishedPostRow = {
  category: string;
  character: string;
  cosplayer: string;
  created_at: string;
  description: string | null;
  file_size: string | null;
  hero_image_url: string | null;
  id: string;
  photo_count: number;
  slug: string;
  source: string;
  status: AdminPostDraft['status'];
  tags: string[];
  thumbnail_url: string | null;
  title: string;
  total_views: number;
  unzip_password: string | null;
  updated_at: string;
  video_count: number;
  views_24h: number;
  views_3d: number;
  views_7d: number;
  download_links: Array<{
    provider: 'mediafire' | 'telegram' | 'sorafolder' | 'gofile';
    url: string;
  }> | null;
  preview_media: Array<{
    alt_text: string | null;
    duration: string | null;
    height: number | null;
    id: string;
    media_type: 'image' | 'video';
    poster_url: string | null;
    sort_order: number;
    url: string | null;
    width: number | null;
  }> | null;
};

const dataDirectory = path.join(process.cwd(), '.data');
const draftsFile = path.join(dataDirectory, 'admin-post-drafts.json');
const publishedFile = path.join(dataDirectory, 'admin-published-posts.json');
const fallbackThumbnail = '/images/tunacosplay/fox-cutie.svg';

export async function getPublishedPosts() {
  const supabasePosts = await listSupabasePublishedPosts();
  return supabasePosts ?? (await readLocalPublishedPosts());
}

export async function getManagedPosts() {
  const supabasePosts = await listSupabaseManagedPosts();
  if (supabasePosts) {
    return supabasePosts;
  }

  const localPosts = await readLocalPublishedPosts();
  return localPosts.map((post) => ({
    ...post,
    status: 'published' as const,
  }));
}

export async function getPublishedPostBySlug(slug: string) {
  const posts = await getPublishedPosts();
  return posts.find((post) => post.slug === slug);
}

export async function getManagedPostById(id: string) {
  const posts = await getManagedPosts();
  return posts.find((post) => post.id === id);
}

export async function publishAdminDraft(draft: AdminPostDraft) {
  const supabasePosts = await publishSupabasePost(draft);
  if (supabasePosts) {
    return supabasePosts;
  }

  const publishedPosts = await readLocalPublishedPosts();
  const post = draftToPost(draft);
  const existingIndex = publishedPosts.findIndex(
    (item) => item.id === post.id || item.slug === post.slug,
  );

  if (draft.status !== 'published') {
    if (existingIndex >= 0) {
      publishedPosts.splice(existingIndex, 1);
    }
    await writeLocalPublishedPosts(publishedPosts);
    return publishedPosts;
  }

  if (existingIndex >= 0) {
    publishedPosts[existingIndex] = post;
  } else {
    publishedPosts.unshift(post);
  }

  await writeLocalPublishedPosts(publishedPosts);
  await removeLocalDraft(draft.id);

  return publishedPosts;
}

export async function deletePublishedPost(id: string) {
  const supabasePosts = await deleteSupabasePost(id);
  if (supabasePosts) {
    return supabasePosts;
  }

  const publishedPosts = await readLocalPublishedPosts();
  const nextPosts = publishedPosts.filter((post) => post.id !== id);
  await writeLocalPublishedPosts(nextPosts);
  return nextPosts.map((post) => ({
    ...post,
    status: 'published' as const,
  }));
}

export function managedPostToDraft(post: ManagedPost): AdminPostDraft {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    cosplayer: post.cosplayer,
    character: post.character,
    source: post.source,
    category: post.category as AdminPostDraft['category'],
    tags: post.tags as AdminPostDraft['tags'],
    photoCount: post.photoCount,
    videoCount: post.videoCount,
    thumbnailUrl: post.thumbnail,
    heroImageUrl: post.heroImage ?? '',
    fileSize: post.fileSize ?? '',
    unzipPassword: post.unzipPassword ?? 'cosplaytele',
    description: post.description ?? '',
    downloadLinks: {
      mediafire: post.downloadLinks?.mediafire ?? '',
      telegram: post.downloadLinks?.telegram ?? '',
      sorafolder: post.downloadLinks?.sorafolder ?? '',
      gofile: post.downloadLinks?.gofile ?? '',
    },
    previewMedia: (post.previewMedia ?? []).map((media) => ({
      id: media.id,
      type: media.type,
      fileName: media.alt || media.id,
      fileSize: 0,
      url: media.url,
      posterUrl: media.posterUrl,
      alt: media.alt ?? '',
      width: media.width,
      height: media.height,
      duration: media.duration,
      sortOrder: media.sortOrder,
      storageStatus: 'uploaded',
    })),
    status: post.status,
    createdAt: post.createdAt ?? new Date().toISOString(),
    updatedAt: post.updatedAt ?? new Date().toISOString(),
  };
}

async function listSupabasePublishedPosts() {
  const posts = await listSupabasePosts('published');
  return posts?.map(stripManagedPost) ?? null;
}

async function listSupabaseManagedPosts() {
  return listSupabasePosts();
}

async function listSupabasePosts(status?: AdminPostDraft['status']) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  let query = supabase
    .from('posts')
    .select(
      'id, slug, title, cosplayer, character, source, category, tags, photo_count, video_count, thumbnail_url, hero_image_url, file_size, unzip_password, description, status, views_24h, views_3d, views_7d, total_views, created_at, updated_at, preview_media(id, media_type, url, poster_url, alt_text, width, height, duration, sort_order), download_links(provider, url)',
    )
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as PublishedPostRow[]).map(rowToManagedPost);
}

async function publishSupabasePost(draft: AdminPostDraft) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  const postPayload = {
    id: draft.id,
    slug: draft.slug,
    title: draft.title,
    cosplayer: draft.cosplayer,
    character: draft.character,
    source: draft.source,
    category: draft.category,
    tags: draft.tags,
    photo_count: draft.photoCount,
    video_count: draft.videoCount,
    thumbnail_url: draft.thumbnailUrl || null,
    hero_image_url: draft.heroImageUrl || null,
    file_size: draft.fileSize || null,
    unzip_password: draft.unzipPassword || 'cosplaytele',
    description: draft.description || null,
    status: draft.status,
    created_at: draft.createdAt,
    updated_at: draft.updatedAt,
  };

  const { error: postError } = await supabase
    .from('posts')
    .upsert(postPayload, { onConflict: 'id' });

  if (postError) {
    throw new Error(postError.message);
  }

  const { error: deleteMediaError } = await supabase
    .from('preview_media')
    .delete()
    .eq('post_id', draft.id);

  if (deleteMediaError) {
    throw new Error(deleteMediaError.message);
  }

  if (draft.previewMedia.length > 0) {
    const { error: mediaError } = await supabase.from('preview_media').insert(
      draft.previewMedia.map((media) => ({
        id: media.id,
        post_id: draft.id,
        media_type: media.type,
        url: media.url || null,
        poster_url: media.posterUrl || null,
        alt_text: media.alt || null,
        width: media.width || null,
        height: media.height || null,
        duration: media.duration || null,
        sort_order: media.sortOrder,
      })),
    );

    if (mediaError) {
      throw new Error(mediaError.message);
    }
  }

  const { error: deleteLinksError } = await supabase
    .from('download_links')
    .delete()
    .eq('post_id', draft.id);

  if (deleteLinksError) {
    throw new Error(deleteLinksError.message);
  }

  const links = Object.entries(draft.downloadLinks)
    .filter(([, url]) => url.trim())
    .map(([provider, url]) => ({
      post_id: draft.id,
      provider,
      url,
    }));

  if (links.length > 0) {
    const { error: linksError } = await supabase.from('download_links').insert(links);

    if (linksError) {
      throw new Error(linksError.message);
    }
  }

  return listSupabasePublishedPosts();
}

async function deleteSupabasePost(id: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  const { error } = await supabase.from('posts').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return listSupabaseManagedPosts();
}

async function readLocalPublishedPosts() {
  try {
    const contents = await readFile(publishedFile, 'utf8');
    const parsed: unknown = JSON.parse(contents);
    return Array.isArray(parsed) ? (parsed as Post[]) : [];
  } catch (error) {
    if (isNotFoundError(error)) {
      return [];
    }

    throw error;
  }
}

async function writeLocalPublishedPosts(posts: Post[]) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(publishedFile, JSON.stringify(posts, null, 2));
}

async function removeLocalDraft(id: string) {
  try {
    const contents = await readFile(draftsFile, 'utf8');
    const parsed: unknown = JSON.parse(contents);
    const drafts = Array.isArray(parsed) ? (parsed as AdminPostDraft[]) : [];
    await writeFile(
      draftsFile,
      JSON.stringify(drafts.filter((draft) => draft.id !== id), null, 2),
    );
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error;
    }
  }
}

function rowToManagedPost(row: PublishedPostRow): ManagedPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    cosplayer: row.cosplayer,
    character: row.character,
    source: row.source,
    tags: row.tags,
    category: row.category,
    thumbnail: normalizePublicMediaUrl(row.thumbnail_url) || fallbackThumbnail,
    photoCount: row.photo_count,
    videoCount: row.video_count,
    views24h: row.views_24h,
    views3d: row.views_3d,
    views7d: row.views_7d,
    totalViews: row.total_views,
    fileSize: row.file_size ?? undefined,
    unzipPassword: row.unzip_password ?? undefined,
    downloadLinks: downloadLinksToPost(row.download_links ?? []),
    previewMedia: (row.preview_media ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((media) => ({
        id: media.id,
        type: media.media_type,
        url: normalizePublicMediaUrl(media.url) || undefined,
        posterUrl: normalizePublicMediaUrl(media.poster_url) || undefined,
        alt: media.alt_text ?? undefined,
        width: media.width ?? undefined,
        height: media.height ?? undefined,
        duration: media.duration ?? undefined,
        sortOrder: media.sort_order,
      })),
    heroImage: normalizePublicMediaUrl(row.hero_image_url) || undefined,
    description: row.description ?? undefined,
    createdAt: row.created_at,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

function stripManagedPost(post: ManagedPost): Post {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    cosplayer: post.cosplayer,
    character: post.character,
    source: post.source,
    tags: post.tags,
    category: post.category,
    thumbnail: post.thumbnail,
    photoCount: post.photoCount,
    videoCount: post.videoCount,
    views24h: post.views24h,
    views3d: post.views3d,
    views7d: post.views7d,
    totalViews: post.totalViews,
    fileSize: post.fileSize,
    unzipPassword: post.unzipPassword,
    downloadLinks: post.downloadLinks,
    previewMedia: post.previewMedia,
    heroImage: post.heroImage,
    description: post.description,
  };
}

function draftToPost(draft: AdminPostDraft): Post {
  const thumbnail =
    draft.thumbnailUrl ||
    draft.heroImageUrl ||
    draft.previewMedia.find((media) => media.url)?.url ||
    fallbackThumbnail;

  return {
    id: draft.id,
    slug: draft.slug,
    title: draft.title,
    cosplayer: draft.cosplayer,
    character: draft.character,
    source: draft.source,
    tags: draft.tags,
    category: draft.category,
    thumbnail,
    photoCount: draft.photoCount,
    videoCount: draft.videoCount,
    views24h: 0,
    views3d: 0,
    views7d: 0,
    totalViews: 0,
    fileSize: draft.fileSize || undefined,
    unzipPassword: draft.unzipPassword || undefined,
    downloadLinks: draft.downloadLinks,
    previewMedia: draft.previewMedia.map((media) => ({
      id: media.id,
      type: media.type,
      url: media.url,
      posterUrl: media.posterUrl,
      alt: media.alt || media.fileName,
      width: media.width,
      height: media.height,
      duration: media.duration,
      sortOrder: media.sortOrder,
    })),
    heroImage: draft.heroImageUrl || undefined,
    description: draft.description || undefined,
  };
}

function downloadLinksToPost(rowLinks: NonNullable<PublishedPostRow['download_links']> = []) {
  return rowLinks.reduce<Post['downloadLinks']>(
    (links, link) => ({
      ...links,
      [link.provider]: link.url,
    }),
    {},
  );
}

function normalizePublicMediaUrl(url: string | null | undefined) {
  if (!url) {
    return '';
  }

  const publicBaseUrl = process.env.PUBLIC_STORAGE_BASE_URL?.replace(/\/+$/, '');
  if (!publicBaseUrl) {
    return url;
  }

  return url.replace(/^http:\/\/kong:8000(?=\/storage\/v1\/)/, publicBaseUrl);
}

function isNotFoundError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ENOENT'
  );
}
