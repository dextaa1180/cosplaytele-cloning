import { revalidatePath } from 'next/cache';
import type { AdminPostDraft } from '@/lib/admin-drafts';
import { getPublishedPosts, publishAdminDraft } from '@/lib/published-posts';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const posts = await getPublishedPosts();
  return Response.json({ posts });
}

export async function POST(request: Request) {
  try {
    const draft = (await request.json()) as AdminPostDraft;
    const normalizedDraft = {
      ...draft,
      thumbnailUrl: getPublishThumbnailUrl(draft),
      status: 'published' as const,
    };
    const error = validatePublishPayload(normalizedDraft);

    if (error) {
      return Response.json({ error }, { status: 400 });
    }

    const posts = await publishAdminDraft(normalizedDraft);

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/explore-categories');
    revalidatePath(`/${normalizedDraft.slug}`);
    revalidatePath(`/category/${normalizedDraft.category}`);

    return Response.json({ posts });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

function validatePublishPayload(draft: AdminPostDraft) {
  if (!draft.title?.trim()) return 'Title is required.';
  if (!draft.slug?.trim()) return 'Slug is required.';
  if (!draft.cosplayer?.trim()) return 'Cosplayer is required.';
  if (!draft.character?.trim()) return 'Character is required.';
  if (!draft.source?.trim()) return 'Source is required.';
  if (!draft.thumbnailUrl?.trim()) {
    return 'Thumbnail URL or uploaded preview image is required.';
  }
  return null;
}

function getPublishThumbnailUrl(draft: AdminPostDraft) {
  return (
    draft.thumbnailUrl?.trim() ||
    draft.previewMedia.find((media) => media.type === 'image' && media.url)?.url ||
    draft.previewMedia.find((media) => media.url)?.url ||
    ''
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to publish post.';
}
