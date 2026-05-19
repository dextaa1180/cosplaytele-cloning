import { AdminPostDraft } from '@/lib/admin-drafts';
import { getSupabaseAdminClient } from '@/lib/supabase/server';

type PostRow = {
  category: string;
  character: string;
  cosplayer: string;
  created_at: string;
  description: string | null;
  file_size: string | null;
  id: string;
  hero_image_url: string | null;
  photo_count: number;
  slug: string;
  source: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  thumbnail_url: string | null;
  title: string;
  unzip_password: string | null;
  updated_at: string;
  video_count: number;
};

type PreviewMediaRow = {
  alt_text: string | null;
  duration: string | null;
  height: number | null;
  id: string;
  media_type: 'image' | 'video';
  poster_url: string | null;
  sort_order: number;
  url: string | null;
  width: number | null;
};

type DownloadLinkRow = {
  provider: 'mediafire' | 'telegram' | 'sorafolder' | 'gofile';
  url: string;
};

type DraftPostRow = PostRow & {
  download_links: DownloadLinkRow[];
  preview_media: PreviewMediaRow[];
};

export async function listSupabaseDrafts() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('posts')
    .select(
      'id, slug, title, cosplayer, character, source, category, tags, photo_count, video_count, thumbnail_url, hero_image_url, file_size, unzip_password, description, status, created_at, updated_at, preview_media(id, media_type, url, poster_url, alt_text, width, height, duration, sort_order), download_links(provider, url)',
    )
    .eq('status', 'draft')
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as DraftPostRow[]).map(rowToDraft);
}

export async function upsertSupabaseDraft(draft: AdminPostDraft) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  const postPayload = {
    id: draft.id,
    slug: draft.slug || `draft-${draft.id}`,
    title: draft.title || 'Untitled draft',
    cosplayer: draft.cosplayer || 'Unknown',
    character: draft.character || 'Unknown',
    source: draft.source || 'Unknown',
    category: draft.category,
    tags: draft.tags,
    photo_count: draft.photoCount,
    video_count: draft.videoCount,
    thumbnail_url: draft.thumbnailUrl || null,
    hero_image_url: draft.heroImageUrl || null,
    file_size: draft.fileSize || null,
    unzip_password: draft.unzipPassword || 'cosplaytele',
    description: draft.description || null,
    status: 'draft' as const,
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

  return listSupabaseDrafts();
}

export async function deleteSupabaseDraft(id: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  const { error } = await supabase.from('posts').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return listSupabaseDrafts();
}

function rowToDraft(row: DraftPostRow): AdminPostDraft {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    cosplayer: row.cosplayer,
    character: row.character,
    source: row.source,
    category: row.category as AdminPostDraft['category'],
    tags: row.tags as AdminPostDraft['tags'],
    photoCount: row.photo_count,
    videoCount: row.video_count,
    thumbnailUrl: row.thumbnail_url ?? '',
    heroImageUrl: row.hero_image_url ?? '',
    fileSize: row.file_size ?? '',
    unzipPassword: row.unzip_password ?? 'cosplaytele',
    description: row.description ?? '',
    downloadLinks: {
      mediafire: row.download_links.find((link) => link.provider === 'mediafire')?.url ?? '',
      telegram: row.download_links.find((link) => link.provider === 'telegram')?.url ?? '',
      sorafolder: row.download_links.find((link) => link.provider === 'sorafolder')?.url ?? '',
      gofile: row.download_links.find((link) => link.provider === 'gofile')?.url ?? '',
    },
    previewMedia: row.preview_media
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((media) => ({
        id: media.id,
        type: media.media_type,
        fileName: media.alt_text ?? media.id,
        fileSize: 0,
        url: media.url ?? undefined,
        posterUrl: media.poster_url ?? undefined,
        alt: media.alt_text ?? '',
        width: media.width ?? undefined,
        height: media.height ?? undefined,
        duration: media.duration ?? undefined,
        sortOrder: media.sort_order,
        storageStatus: 'local-only',
      })),
    status: row.status === 'draft' ? 'draft' : 'draft',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
